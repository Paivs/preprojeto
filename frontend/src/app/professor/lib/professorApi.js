import { apiFetch } from "@/lib/api";
export async function listarTurmas(){return (await apiFetch("/api/turmas"))?.dados??[];}
export async function listarEquipamentos(){const r=await apiFetch("/api/equipamentos?limite=100");return (r?.dados??[]).map(x=>({...x,patrimonio:x.codigo_patrimonio}));}
export async function listarAgendamentos(){return (await apiFetch("/api/agendamentos"))?.dados??[];}
export async function criarAgendamento(formulario){return (await apiFetch("/api/agendamentos",{method:"POST",body:formulario}))?.dados;}
export async function cancelarAgendamento(id){return apiFetch(`/api/agendamentos/${id}/cancelar`,{method:"PATCH"});}
export async function listarInspecoes(){return (await apiFetch("/api/inspecoes"))?.dados??[];}
export async function buscarRespostasInspecao(id){return (await apiFetch(`/api/inspecoes/${id}/respostas`))?.dados??[];}
export async function registrarInspecao(dados){return (await apiFetch("/api/inspecoes",{method:"POST",body:dados}))?.dados;}
