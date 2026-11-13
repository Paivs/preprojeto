import * as Service from "../services/InspecaoService.js";
export async function listar(req,res,next){try{return res.json({sucesso:true,dados:await Service.listar(Number(req.usuario.id))});}catch(e){return next(e);}}
export async function buscarRespostas(req,res,next){try{return res.json({sucesso:true,dados:await Service.buscarRespostas(req.params.id,Number(req.usuario.id))});}catch(e){return next(e);}}
export async function registrar(req,res,next){try{return res.status(201).json({sucesso:true,dados:await Service.registrar(req.body,req.usuario)});}catch(e){return next(e);}}
export async function abrirChamado(req,res,next){try{return res.status(201).json({sucesso:true,dados:await Service.abrirChamadoDeInspecao(req.params.id,req.body,req.usuario)});}catch(e){return next(e);}}
