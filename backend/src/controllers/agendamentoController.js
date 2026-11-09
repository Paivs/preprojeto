import * as Service from "../services/agendamentoService.js";
function erro(e,res,next){if(e instanceof TypeError)return res.status(400).json({sucesso:false,erro:e.message});if(e.status)return res.status(e.status).json({sucesso:false,erro:e.message});if(e.message.includes("nao encontrado"))return res.status(404).json({sucesso:false,erro:e.message});return next(e);}
export async function listar(req,res,next){try{return res.json({sucesso:true,dados:await Service.listarPorProfessor(Number(req.usuario.id))});}catch(e){return erro(e,res,next);}}
export async function criar(req,res,next){try{return res.status(201).json({sucesso:true,dados:await Service.criar(req.body,req.usuario)});}catch(e){return erro(e,res,next);}}
export async function cancelar(req,res,next){try{await Service.cancelar(req.params.id,Number(req.usuario.id));return res.status(204).send();}catch(e){return erro(e,res,next);}}
