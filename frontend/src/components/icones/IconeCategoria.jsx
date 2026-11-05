import { AirVent, Server, Lightbulb, Coffee, Zap } from "lucide-react";

const icones = {
  "Ar-condicionado": AirVent,
  Servidores: Server,
  Iluminação: Lightbulb,
  Cafeteira: Coffee,
};

export default function IconeCategoria({ categoria, tamanho = 22 }) {
  const Icone = icones[categoria] || Zap;
  return <Icone size={tamanho} strokeWidth={1.8} />;
}
