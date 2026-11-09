import * as Service from "../services/inspecaoService.js";
function erro(e,res,next){if(e instanceof TypeError)return res.status(400).json({sucesso:false,erro:e.message});if(e.status)return res.status(e.status).json({sucesso:false,erro:e.message});if(e.message.includes("nao encontrada"))return res.status(404).json({sucesso:false,erro:e.message});return next(e);}
export async function listar(req,res,next){try{return res.json({sucesso:true,dados:await Service.listar(Number(req.usuario.id))});}catch(e){return erro(e,res,next);}}
export async function buscarRespostas(req,res,next){try{return res.json({sucesso:true,dados:await Service.buscarRespostas(req.params.id,Number(req.usuario.id))});}catch(e){return erro(e,res,next);}}
export async function registrar(req,res,next){try{return res.status(201).json({sucesso:true,dados:await Service.registrar(req.body,req.usuario)});}catch(e){return erro(e,res,next);}}
