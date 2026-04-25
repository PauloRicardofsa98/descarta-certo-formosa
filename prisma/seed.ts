import bcrypt from "bcryptjs";
import { gerarSlug } from "../app/_lib/slug";
import { prisma } from "@/app/_lib/db";

type TipoSeed = {
  nome: string;
  descricao: string;
  instrucoesPreparo: string;
  sinonimos: string;
};

const tipos: TipoSeed[] = [
  {
    nome: "Pilhas e baterias pequenas",
    descricao:
      "Pilhas alcalinas, recarregáveis e baterias de aparelhos pequenos.",
    instrucoesPreparo:
      "Armazene em recipiente seco; não fure nem amasse; entregue em pontos de logística reversa.",
    sinonimos: "pilha, bateria, AA, AAA, palito, botão, recarregável",
  },
  {
    nome: "Lâmpadas",
    descricao: "Fluorescentes, LED, halógenas e incandescentes.",
    instrucoesPreparo:
      "Embale com papelão ou plástico-bolha para evitar quebra. Lâmpadas fluorescentes contêm mercúrio — nunca jogue no lixo comum.",
    sinonimos: "lâmpada, fluorescente, LED, halógena, incandescente, bulbo",
  },
  {
    nome: "Eletrônicos pequenos",
    descricao:
      "Celulares, controles, fones, mouses, teclados, carregadores e cabos.",
    instrucoesPreparo:
      "Apague dados pessoais antes de descartar. Remova baterias quando possível.",
    sinonimos:
      "celular, smartphone, controle, fone, mouse, teclado, carregador, cabo, pen drive, eletrônico",
  },
  {
    nome: "Eletrodomésticos",
    descricao: "Linha branca (geladeira, fogão, máquina) e marrom (TV, som).",
    instrucoesPreparo:
      "Agende coleta com o ponto. Aparelhos com gás (geladeira, ar-condicionado) precisam de descarte especializado.",
    sinonimos:
      "geladeira, freezer, fogão, micro-ondas, máquina de lavar, TV, ar-condicionado, eletrodoméstico",
  },
  {
    nome: "Óleo de cozinha usado",
    descricao: "Óleo vegetal usado em frituras.",
    instrucoesPreparo:
      "Armazene em garrafa PET fechada; evite contaminar com restos de comida ou água.",
    sinonimos: "óleo, gordura, óleo vegetal, óleo de fritura",
  },
  {
    nome: "Medicamentos vencidos",
    descricao: "Remédios fora da validade ou em desuso.",
    instrucoesPreparo:
      "Leve à farmácia parceira de logística reversa. Nunca descarte em pia, vaso ou lixo comum.",
    sinonimos: "remédio, comprimido, xarope, pomada, antibiótico, medicamento",
  },
  {
    nome: "Papel e papelão",
    descricao: "Material reciclável seco.",
    instrucoesPreparo:
      "Mantenha seco e limpo; desmonte caixas; remova fitas e plásticos.",
    sinonimos: "papel, jornal, revista, caderno, caixa, papelão, cartolina",
  },
  {
    nome: "Plástico",
    descricao: "Embalagens, garrafas e utensílios plásticos.",
    instrucoesPreparo:
      "Lave rapidamente para remover restos; amasse garrafas para otimizar espaço.",
    sinonimos: "garrafa PET, embalagem, sacola, copo, pote, tampinha, plástico",
  },
  {
    nome: "Vidro",
    descricao: "Garrafas, frascos e potes de vidro.",
    instrucoesPreparo:
      'Lave; embale cacos em jornal ou caixa rígida com aviso "VIDRO" para proteger coletores.',
    sinonimos: "garrafa, pote, frasco, copo de vidro, vidro",
  },
  {
    nome: "Metal e alumínio",
    descricao: "Latas, alumínio, ferro e cobre.",
    instrucoesPreparo:
      "Lave; amasse latinhas; latas grandes podem ir inteiras.",
    sinonimos: "lata, alumínio, cobre, ferro, latinha, metal",
  },
  {
    nome: "Embalagens longa-vida (Tetra Pak)",
    descricao: "Caixas cartonadas de leite, suco e similares.",
    instrucoesPreparo: "Lave; achate; descarte com recicláveis.",
    sinonimos:
      "caixa de leite, caixa de suco, embalagem cartonada, longa-vida, Tetra Pak",
  },
  {
    nome: "Resíduos orgânicos",
    descricao: "Restos de alimentos e cascas.",
    instrucoesPreparo:
      "Separe do lixo seco; idealmente, composte em casa ou entregue em ponto de compostagem.",
    sinonimos: "comida, casca, restos, sobra, alimento, orgânico",
  },
  {
    nome: "Podas e galhos",
    descricao: "Resíduos vegetais de jardim.",
    instrucoesPreparo:
      "Amarre em feixes pequenos; evite misturar com outros resíduos.",
    sinonimos: "galho, mato, capim, jardim, folhagem, grama, poda",
  },
  {
    nome: "Entulho de construção",
    descricao: "Restos de obras e reformas.",
    instrucoesPreparo:
      "Volumes grandes exigem caçamba; pequenos podem ir a ecopontos da cidade.",
    sinonimos:
      "tijolo, cimento, concreto, gesso, argamassa, bloco, telha, entulho",
  },
  {
    nome: "Móveis e colchões",
    descricao: "Resíduos volumosos.",
    instrucoesPreparo:
      "Agende com o ponto que aceita volumosos; alguns programas reaproveitam o material.",
    sinonimos: "sofá, colchão, cadeira, mesa, armário, móvel, volumoso",
  },
  {
    nome: "Roupas, calçados e tecidos",
    descricao: "Vestuário e itens têxteis em geral.",
    instrucoesPreparo:
      "Lave; doe se ainda em uso; descarte como tecido se não-aproveitável.",
    sinonimos: "roupa, sapato, tênis, cobertor, lençol, tecido, calçado",
  },
  {
    nome: "Pneus",
    descricao: "Pneus inservíveis.",
    instrucoesPreparo:
      "Empilhe; entregue em borracharias parceiras ou pontos de logística reversa.",
    sinonimos: "pneu, pneu velho, câmara",
  },
  {
    nome: "Cápsulas de café e cartuchos de tinta",
    descricao: "Itens com logística reversa específica do fabricante.",
    instrucoesPreparo:
      "Cápsulas: armazene em saco. Cartuchos: leve a lojas ou pontos da fabricante.",
    sinonimos:
      "cápsula, Nespresso, Dolce Gusto, cartucho, toner, tinta de impressora",
  },
  {
    nome: "Tintas, solventes e produtos químicos",
    descricao: "Resíduos químicos domésticos.",
    instrucoesPreparo:
      "Nunca despeje em pia ou solo; mantenha em embalagem original; entregue em ponto especializado.",
    sinonimos: "tinta, thinner, removedor, solvente, verniz, esmalte, químico",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env antes de rodar o seed.",
    );
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { senhaHash },
    create: { email, senhaHash },
  });

  console.log(`✓ Admin garantido: ${email}`);
}

async function seedTipos() {
  let inseridos = 0;
  let atualizados = 0;

  for (const [indice, tipo] of tipos.entries()) {
    const slug = gerarSlug(tipo.nome);
    const ordem = (indice + 1) * 10;

    const existente = await prisma.tipoDeResiduo.findUnique({
      where: { slug },
    });

    await prisma.tipoDeResiduo.upsert({
      where: { slug },
      update: {
        nome: tipo.nome,
        descricao: tipo.descricao,
        instrucoesPreparo: tipo.instrucoesPreparo,
        sinonimos: tipo.sinonimos,
        ordem,
      },
      create: {
        nome: tipo.nome,
        slug,
        descricao: tipo.descricao,
        instrucoesPreparo: tipo.instrucoesPreparo,
        sinonimos: tipo.sinonimos,
        ordem,
      },
    });

    if (existente) atualizados++;
    else inseridos++;
  }

  console.log(
    `✓ Tipos de resíduo: ${inseridos} inseridos, ${atualizados} atualizados`,
  );
}

async function main() {
  console.log("Iniciando seed...");
  await seedAdmin();
  await seedTipos();
  console.log("Seed concluído.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
