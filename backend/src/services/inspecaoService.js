import Chamado from "../models/Chamado.js";
import * as AgendamentoModel from "../models/agendamentoModel.js";
import * as ChamadoModel from "../models/chamadoModel.js";
import * as ChecklistItemModel from "../models/checklistItemModel.js";
import * as ChecklistModeloModel from "../models/checklistModeloModel.js";
import * as EquipamentoModel from "../models/equipamentoModel.js";
import * as InspecaoModel from "../models/inspecaoModel.js";

export async function listar(professorId) {
 const pend=await InspecaoModel.listarPendentes(professorId), done=await InspecaoModel.listarRealizadasPorProfessor(professorId);
 for(const p of pend){const m=await ChecklistModeloModel.buscarPorTipoEtapa(p.tipoEquipamento,p.etapa);const its=m?await ChecklistItemModel.listarPorModelo(m.id):[];p.modelo=m?.titulo||"";p.checklist=its.map(i=>({id:i.id,texto:i.descricao,critico:Boolean(i.critico)}));p.resultado=null;}
 return [...pend,...done].sort((a,b)=>`${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`));
}
export async function buscarRespostas(id,professorId){const i=await InspecaoModel.buscarComAgendamento(Number(id));if(!i)throw new Error("Inspecao nao encontrada.");if(Number(i.responsavel_id)!==Number(professorId)){const e=new Error("Acesso negado.");e.status=403;throw e;}return InspecaoModel.buscarRespostas(Number(id));}
export async function registrar(dados,user){
 const aid=Number(dados.agendamentoId), etapa=dados.etapa;if(!Number.isInteger(aid)||aid<=0||!['PRE_USO','POS_USO'].includes(etapa))throw new TypeError("Agendamento ou etapa inválidos.");
 const a=await AgendamentoModel.buscarPorId(aid);if(!a)throw new Error("Agendamento nao encontrado.");if(Number(a.responsavel_id)!==Number(user.id)){const e=new Error("Acesso negado.");e.status=403;throw e;}
 if((etapa==='PRE_USO'&&a.status!=='CONFIRMADO')||(etapa==='POS_USO'&&a.status!=='EM_ANDAMENTO'))throw new TypeError("Etapa não permitida para o status atual.");
 const eq=await EquipamentoModel.buscarPorId(a.equipamento_id), modelo=await ChecklistModeloModel.buscarPorTipoEtapa(eq.tipo,etapa), itens=modelo?await ChecklistItemModel.listarPorModelo(modelo.id):[];
 const answers=new Map((Array.isArray(dados.respostas)?dados.respostas:[]).map(r=>[Number(r.itemId),r]));if(!itens.length||itens.some(i=>typeof answers.get(i.id)?.conforme!=='boolean'))throw new TypeError("Responda todos os itens do checklist.");
 const fail=itens.some(i=>i.critico&&!answers.get(i.id).conforme), bad=itens.some(i=>!answers.get(i.id).conforme), result=fail?'REPROVADO':bad?'APROVADO_COM_RESSALVAS':'APROVADO';
 const id=await InspecaoModel.criar({agendamento_id:aid,modelo_id:modelo.id,professor_id:Number(user.id),etapa,resultado:result,observacoes:dados.observacoes||''});
 await InspecaoModel.criarRespostas(id,itens.map(i=>({item_id:i.id,conforme:answers.get(i.id).conforme,observacao:answers.get(i.id).observacao||null})));
 await EquipamentoModel.atualizarStatus(eq.id,fail?'EM_MANUTENCAO':etapa==='PRE_USO'?'EM_USO':'DISPONIVEL');
 if(etapa==='PRE_USO'&&!fail)await AgendamentoModel.atualizarStatus(aid,'EM_ANDAMENTO');if(etapa==='POS_USO')await AgendamentoModel.atualizarStatus(aid,'CONCLUIDO');
 if(fail){const c=new Chamado({id:1,equipamento_id:eq.id,solicitante_id:Number(user.id),titulo:`Falha na inspeção — ${eq.nome}`,descricao:'Item crítico reprovado no checklist de inspeção.',tipo:'CORRETIVO',severidade:'ALTA'});await ChamadoModel.criar(c);}
 return {id,resultado:result,equipamento:eq.nome};
}
