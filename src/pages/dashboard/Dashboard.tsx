import {
  ArrowRight,
  Buildings,
  ChartLineUp,
  CheckCircle,
  IdentificationCard,
  Money,
  PlusCircle,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/useAuth';
import type { Departamento } from '../../models/Departamento';
import type { Funcionario } from '../../models/Funcionario';
import type { Usuario } from '../../models/Usuario';
import { listarDepartamentos } from '../../services/departamentoService';
import { listarFuncionarios } from '../../services/funcionarioService';
import { listarUsuarios } from '../../services/usuarioService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DashboardData {
  usuarios: Usuario[];
  departamentos: Departamento[];
  funcionarios: Funcionario[];
}

interface DepartmentMetric {
  nome: string;
  total: number;
  percent: number;
}

interface DashboardAction {
  title: string;
  description: string;
  to: string;
  icon: Icon;
  color: string;
}

const initialData: DashboardData = {
  usuarios: [],
  departamentos: [],
  funcionarios: [],
};

function getFuncionarioSalary(funcionario: Funcionario): number {
  if (typeof funcionario.salario === 'number') {
    return funcionario.salario;
  }

  const valorHora = funcionario.valorHora ?? 0;
  const horasTrabalhadas = funcionario.horasTrabalhadas ?? 0;
  const descontos = funcionario.descontos ?? 0;
  const salarioCalculado = valorHora * horasTrabalhadas - descontos;

  return Math.max(0, salarioCalculado);
}

function getDepartmentName(funcionario: Funcionario): string {
  return funcionario.departamento?.nome || 'Sem departamento';
}

function getDepartmentMetrics(funcionarios: Funcionario[]): DepartmentMetric[] {
  const totals = funcionarios.reduce<Record<string, number>>((accumulator, funcionario) => {
    const departmentName = getDepartmentName(funcionario);
    accumulator[departmentName] = (accumulator[departmentName] ?? 0) + 1;
    return accumulator;
  }, {});

  const maxTotal = Math.max(1, ...Object.values(totals));

  return Object.entries(totals)
    .map(([nome, total]) => ({
      nome,
      total,
      percent: Math.round((total / maxTotal) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function getRecentFuncionarios(funcionarios: Funcionario[]): Funcionario[] {
  return [...funcionarios]
    .sort((a, b) => {
      const firstDate = a.dataContratacao ? new Date(a.dataContratacao).getTime() : 0;
      const secondDate = b.dataContratacao ? new Date(b.dataContratacao).getTime() : 0;
      return secondDate - firstDate;
    })
    .slice(0, 4);
}

function Dashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const [usuarios, departamentos, funcionarios] = await Promise.all([
          listarUsuarios(),
          listarDepartamentos(),
          listarFuncionarios(),
        ]);

        setData({
          usuarios,
          departamentos,
          funcionarios,
        });
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const totalUsuarios = data.usuarios.length;
    const totalDepartamentos = data.departamentos.length;
    const totalFuncionarios = data.funcionarios.length;
    const totalRegistros = totalUsuarios + totalDepartamentos + totalFuncionarios;
    const folhaEstimada = data.funcionarios.reduce((total, funcionario) => total + getFuncionarioSalary(funcionario), 0);
    const mediaSalarial = totalFuncionarios ? folhaEstimada / totalFuncionarios : 0;
    const funcionariosComDepartamento = data.funcionarios.filter((funcionario) => funcionario.departamento?.nome).length;
    const coberturaDepartamentos = totalFuncionarios
      ? Math.round((funcionariosComDepartamento / totalFuncionarios) * 100)
      : 0;

    return {
      totalUsuarios,
      totalDepartamentos,
      totalFuncionarios,
      totalRegistros,
      folhaEstimada,
      mediaSalarial,
      coberturaDepartamentos,
    };
  }, [data]);

  const entityChart = [
    {
      label: 'Usuários',
      value: metrics.totalUsuarios,
      to: '/usuarios',
      icon: UsersThree,
      color: 'bg-ekoa-purple-600',
      softColor: 'bg-ekoa-purple-50 text-ekoa-purple-700',
    },
    {
      label: 'Departamentos',
      value: metrics.totalDepartamentos,
      to: '/departamentos',
      icon: Buildings,
      color: 'bg-ekoa-magenta-600',
      softColor: 'bg-ekoa-magenta-50 text-ekoa-magenta-600',
    },
    {
      label: 'Funcionários',
      value: metrics.totalFuncionarios,
      to: '/funcionarios',
      icon: IdentificationCard,
      color: 'bg-ekoa-blue-600',
      softColor: 'bg-ekoa-gold-50 text-ekoa-blue-600',
    },
  ];

  const maxEntityValue = Math.max(1, ...entityChart.map((item) => item.value));
  const departmentMetrics = getDepartmentMetrics(data.funcionarios);
  const recentFuncionarios = getRecentFuncionarios(data.funcionarios);
  const quickActions: DashboardAction[] = [
    {
      title: 'Cadastrar usuário',
      description: 'Crie um novo acesso para alguém da equipe.',
      to: '/cadastro',
      icon: UsersThree,
      color: 'bg-ekoa-purple-50 text-ekoa-purple-700',
    },
    {
      title: 'Novo departamento',
      description: 'Organize uma área da empresa.',
      to: '/departamentos',
      icon: Buildings,
      color: 'bg-ekoa-magenta-50 text-ekoa-magenta-600',
    },
    {
      title: 'Novo funcionário',
      description: 'Registre uma pessoa na equipe.',
      to: '/funcionarios',
      icon: IdentificationCard,
      color: 'bg-ekoa-gold-50 text-ekoa-blue-600',
    },
  ];
  const nextSteps: DashboardAction[] = [
    ...(metrics.totalDepartamentos === 0
      ? [
          {
            title: 'Comece pelos departamentos',
            description: 'Crie ao menos uma área para conseguir vincular funcionários com mais clareza.',
            to: '/departamentos',
            icon: WarningCircle,
            color: 'bg-ekoa-gold-50 text-ekoa-gold-700',
          },
        ]
      : []),
    ...(metrics.totalFuncionarios === 0
      ? [
          {
            title: 'Cadastre a equipe',
            description: 'Adicione funcionários para liberar gráficos de distribuição e folha estimada.',
            to: '/funcionarios',
            icon: PlusCircle,
            color: 'bg-ekoa-blue-50 text-ekoa-blue-600',
          },
        ]
      : []),
    ...(metrics.totalFuncionarios > 0 && metrics.coberturaDepartamentos < 100
      ? [
          {
            title: 'Complete os vínculos',
            description: 'Alguns funcionários ainda não estão conectados a um departamento.',
            to: '/funcionarios',
            icon: WarningCircle,
            color: 'bg-ekoa-magenta-50 text-ekoa-magenta-600',
          },
        ]
      : []),
  ];
  const visibleNextSteps: DashboardAction[] = nextSteps.length
    ? nextSteps
    : [
        {
          title: 'Tudo pronto para acompanhar',
          description: 'A base já possui informações suficientes para uma leitura geral da equipe.',
          to: '/dashboard',
          icon: CheckCircle,
          color: 'bg-ekoa-purple-50 text-ekoa-purple-700',
        },
      ];

  if (loading) {
    return <LoadingSpinner label="Preparando seu dashboard..." />;
  }

  return (
    <div className="bg-ekoa-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-lg bg-ekoa-navy text-white shadow-lg">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-gold-300">Dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Olá, {usuario?.nome || 'talento'}.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-200">
                Veja um resumo da plataforma, acompanhe os principais cadastros e identifique rapidamente onde agir.
              </p>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ekoa-gold-200">Registros ativos</p>
              <p className="mt-3 text-5xl font-black">{metrics.totalRegistros}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Somando usuários, departamentos e funcionários cadastrados.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Usuários',
              value: metrics.totalUsuarios,
              detail: 'Acessos cadastrados',
              icon: UsersThree,
              to: '/usuarios',
              color: 'text-ekoa-purple-600 bg-ekoa-purple-50',
            },
            {
              title: 'Departamentos',
              value: metrics.totalDepartamentos,
              detail: 'Áreas organizadas',
              icon: Buildings,
              to: '/departamentos',
              color: 'text-ekoa-magenta-600 bg-ekoa-magenta-50',
            },
            {
              title: 'Funcionários',
              value: metrics.totalFuncionarios,
              detail: 'Pessoas na equipe',
              icon: IdentificationCard,
              to: '/funcionarios',
              color: 'text-ekoa-blue-600 bg-ekoa-gold-50',
            },
            {
              title: 'Folha estimada',
              value: formatCurrency(metrics.folhaEstimada),
              detail: `Média: ${formatCurrency(metrics.mediaSalarial)}`,
              icon: Money,
              to: '/funcionarios',
              color: 'text-ekoa-gold-700 bg-ekoa-gold-50',
            },
          ].map((card) => (
            <NavLink
              key={card.title}
              to={card.to}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-ekoa-purple-200 hover:shadow-md"
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon size={26} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-black text-ekoa-navy">{card.value}</p>
              <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Atalhos</p>
            <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Ações rápidas</h2>

            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;

                return (
                  <NavLink
                    key={action.title}
                    to={action.to}
                    className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-ekoa-purple-200 hover:bg-ekoa-paper"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                      <ActionIcon size={24} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ekoa-navy">{action.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{action.description}</span>
                    </span>
                    <ArrowRight size={20} className="shrink-0 text-ekoa-purple-600" aria-hidden="true" />
                  </NavLink>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-magenta-600">Próximos passos</p>
            <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Recomendações para a base</h2>

            <div className="mt-5 grid gap-3">
              {visibleNextSteps.map((step) => {
                const StepIcon = step.icon;

                return (
                  <NavLink
                    key={step.title}
                    to={step.to}
                    className="flex items-start gap-4 rounded-lg bg-ekoa-paper p-4 transition hover:bg-ekoa-purple-50"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${step.color}`}>
                      <StepIcon size={24} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ekoa-navy">{step.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">{step.description}</span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Visão geral</p>
                <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Cadastros por área</h2>
              </div>
              <div className="rounded-lg bg-ekoa-purple-50 p-3 text-ekoa-purple-700">
                <ChartLineUp size={26} aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {entityChart.map((item) => {
                const percent = Math.round((item.value / maxEntityValue) * 100);

                return (
                  <NavLink key={item.label} to={item.to} className="block rounded-lg p-3 transition hover:bg-ekoa-paper">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.softColor}`}>
                          <item.icon size={22} aria-hidden="true" />
                        </span>
                        <span className="font-bold text-ekoa-navy">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-ekoa-navy">{item.value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-magenta-600">Distribuição</p>
            <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Funcionários por departamento</h2>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div
                className="mx-auto flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#7d3f98 0 ${metrics.coberturaDepartamentos}%, #feefc2 ${metrics.coberturaDepartamentos}% 100%)`,
                }}
                aria-label={`${metrics.coberturaDepartamentos}% dos funcionários possuem departamento vinculado`}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                  <span className="text-3xl font-black text-ekoa-navy">{metrics.coberturaDepartamentos}%</span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Vínculo</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {departmentMetrics.length ? (
                  departmentMetrics.map((department) => (
                    <div key={department.nome}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-ekoa-navy">{department.nome}</span>
                        <span className="text-slate-600">{department.total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-ekoa-magenta-600" style={{ width: `${department.percent}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-ekoa-paper p-4 text-sm leading-6 text-slate-600">
                    Cadastre funcionários e vincule departamentos para visualizar a distribuição.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-blue-600">Saúde da base</p>
            <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Indicadores rápidos</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-ekoa-purple-50 p-4">
                <p className="text-sm font-bold text-ekoa-purple-700">Média por departamento</p>
                <p className="mt-2 text-3xl font-black text-ekoa-navy">
                  {metrics.totalDepartamentos ? (metrics.totalFuncionarios / metrics.totalDepartamentos).toFixed(1) : '0'}
                </p>
                <p className="mt-1 text-sm text-slate-600">funcionários por área</p>
              </div>

              <div className="rounded-lg bg-ekoa-gold-50 p-4">
                <p className="text-sm font-bold text-ekoa-gold-700">Base de acessos</p>
                <p className="mt-2 text-3xl font-black text-ekoa-navy">{metrics.totalUsuarios}</p>
                <p className="mt-1 text-sm text-slate-600">pessoas com login</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Movimento recente</p>
                <h2 className="mt-2 text-2xl font-black text-ekoa-navy">Últimas contratações</h2>
              </div>
              <NavLink
                to="/funcionarios"
                className="rounded-lg border border-ekoa-purple-200 px-3 py-2 text-sm font-bold text-ekoa-purple-700 transition hover:bg-ekoa-purple-50"
              >
                Ver todos
              </NavLink>
            </div>

            <div className="mt-5 divide-y divide-slate-200">
              {recentFuncionarios.length ? (
                recentFuncionarios.map((funcionario) => (
                  <div key={funcionario.id ?? `${funcionario.nome}-${funcionario.cargo}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ekoa-blue-50 text-ekoa-blue-600">
                      <IdentificationCard size={22} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ekoa-navy">{funcionario.nome}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {funcionario.cargo} • {getDepartmentName(funcionario)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-500">{formatDate(funcionario.dataContratacao)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-ekoa-paper p-4 text-sm leading-6 text-slate-600">
                  Ainda não há contratações cadastradas para exibir aqui.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
