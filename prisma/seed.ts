import bcrypt from "bcryptjs";

import { prisma } from "@/app/_lib/db";
import { generateSlug } from "@/app/_lib/slug";

type WasteTypeSeed = {
  name: string;
  description: string;
  preparationInstructions: string;
  synonyms: string;
};

const wasteTypes: WasteTypeSeed[] = [
  {
    name: "Pilhas e baterias pequenas",
    description:
      "Pilhas alcalinas, recarregáveis e baterias de aparelhos pequenos.",
    preparationInstructions:
      "Armazene em recipiente seco; não fure nem amasse; entregue em pontos de logística reversa.",
    synonyms: "pilha, bateria, AA, AAA, palito, botão, recarregável",
  },
  {
    name: "Lâmpadas",
    description: "Fluorescentes, LED, halógenas e incandescentes.",
    preparationInstructions:
      "Embale com papelão ou plástico-bolha para evitar quebra. Lâmpadas fluorescentes contêm mercúrio — nunca jogue no lixo comum.",
    synonyms: "lâmpada, fluorescente, LED, halógena, incandescente, bulbo",
  },
  {
    name: "Eletrônicos pequenos",
    description:
      "Celulares, controles, fones, mouses, teclados, carregadores e cabos.",
    preparationInstructions:
      "Apague dados pessoais antes de descartar. Remova baterias quando possível.",
    synonyms:
      "celular, smartphone, controle, fone, mouse, teclado, carregador, cabo, pen drive, eletrônico",
  },
  {
    name: "Eletrodomésticos",
    description: "Linha branca (geladeira, fogão, máquina) e marrom (TV, som).",
    preparationInstructions:
      "Agende coleta com o ponto. Aparelhos com gás (geladeira, ar-condicionado) precisam de descarte especializado.",
    synonyms:
      "geladeira, freezer, fogão, micro-ondas, máquina de lavar, TV, ar-condicionado, eletrodoméstico",
  },
  {
    name: "Óleo de cozinha usado",
    description: "Óleo vegetal usado em frituras.",
    preparationInstructions:
      "Armazene em garrafa PET fechada; evite contaminar com restos de comida ou água.",
    synonyms: "óleo, gordura, óleo vegetal, óleo de fritura",
  },
  {
    name: "Medicamentos vencidos",
    description: "Remédios fora da validade ou em desuso.",
    preparationInstructions:
      "Leve à farmácia parceira de logística reversa. Nunca descarte em pia, vaso ou lixo comum.",
    synonyms: "remédio, comprimido, xarope, pomada, antibiótico, medicamento",
  },
  {
    name: "Papel e papelão",
    description: "Material reciclável seco.",
    preparationInstructions:
      "Mantenha seco e limpo; desmonte caixas; remova fitas e plásticos.",
    synonyms: "papel, jornal, revista, caderno, caixa, papelão, cartolina",
  },
  {
    name: "Plástico",
    description: "Embalagens, garrafas e utensílios plásticos.",
    preparationInstructions:
      "Lave rapidamente para remover restos; amasse garrafas para otimizar espaço.",
    synonyms: "garrafa PET, embalagem, sacola, copo, pote, tampinha, plástico",
  },
  {
    name: "Vidro",
    description: "Garrafas, frascos e potes de vidro.",
    preparationInstructions:
      'Lave; embale cacos em jornal ou caixa rígida com aviso "VIDRO" para proteger coletores.',
    synonyms: "garrafa, pote, frasco, copo de vidro, vidro",
  },
  {
    name: "Metal e alumínio",
    description: "Latas, alumínio, ferro e cobre.",
    preparationInstructions:
      "Lave; amasse latinhas; latas grandes podem ir inteiras.",
    synonyms: "lata, alumínio, cobre, ferro, latinha, metal",
  },
  {
    name: "Embalagens longa-vida (Tetra Pak)",
    description: "Caixas cartonadas de leite, suco e similares.",
    preparationInstructions: "Lave; achate; descarte com recicláveis.",
    synonyms:
      "caixa de leite, caixa de suco, embalagem cartonada, longa-vida, Tetra Pak",
  },
  {
    name: "Resíduos orgânicos",
    description: "Restos de alimentos e cascas.",
    preparationInstructions:
      "Separe do lixo seco; idealmente, composte em casa ou entregue em ponto de compostagem.",
    synonyms: "comida, casca, restos, sobra, alimento, orgânico",
  },
  {
    name: "Podas e galhos",
    description: "Resíduos vegetais de jardim.",
    preparationInstructions:
      "Amarre em feixes pequenos; evite misturar com outros resíduos.",
    synonyms: "galho, mato, capim, jardim, folhagem, grama, poda",
  },
  {
    name: "Entulho de construção",
    description: "Restos de obras e reformas.",
    preparationInstructions:
      "Volumes grandes exigem caçamba; pequenos podem ir a ecopontos da cidade.",
    synonyms:
      "tijolo, cimento, concreto, gesso, argamassa, bloco, telha, entulho",
  },
  {
    name: "Móveis e colchões",
    description: "Resíduos volumosos.",
    preparationInstructions:
      "Agende com o ponto que aceita volumosos; alguns programas reaproveitam o material.",
    synonyms: "sofá, colchão, cadeira, mesa, armário, móvel, volumoso",
  },
  {
    name: "Roupas, calçados e tecidos",
    description: "Vestuário e itens têxteis em geral.",
    preparationInstructions:
      "Lave; doe se ainda em uso; descarte como tecido se não-aproveitável.",
    synonyms: "roupa, sapato, tênis, cobertor, lençol, tecido, calçado",
  },
  {
    name: "Pneus",
    description: "Pneus inservíveis.",
    preparationInstructions:
      "Empilhe; entregue em borracharias parceiras ou pontos de logística reversa.",
    synonyms: "pneu, pneu velho, câmara",
  },
  {
    name: "Cápsulas de café e cartuchos de tinta",
    description: "Itens com logística reversa específica do fabricante.",
    preparationInstructions:
      "Cápsulas: armazene em saco. Cartuchos: leve a lojas ou pontos da fabricante.",
    synonyms:
      "cápsula, Nespresso, Dolce Gusto, cartucho, toner, tinta de impressora",
  },
  {
    name: "Tintas, solventes e produtos químicos",
    description: "Resíduos químicos domésticos.",
    preparationInstructions:
      "Nunca despeje em pia ou solo; mantenha em embalagem original; entregue em ponto especializado.",
    synonyms: "tinta, thinner, removedor, solvente, verniz, esmalte, químico",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env antes de rodar o seed.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`✓ Admin garantido: ${email}`);
}

async function seedWasteTypes() {
  let inserted = 0;
  let updated = 0;

  for (const [index, wasteType] of wasteTypes.entries()) {
    const slug = generateSlug(wasteType.name);
    const order = (index + 1) * 10;

    const existing = await prisma.wasteType.findUnique({ where: { slug } });

    await prisma.wasteType.upsert({
      where: { slug },
      update: {
        name: wasteType.name,
        description: wasteType.description,
        preparationInstructions: wasteType.preparationInstructions,
        synonyms: wasteType.synonyms,
        order,
      },
      create: {
        name: wasteType.name,
        slug,
        description: wasteType.description,
        preparationInstructions: wasteType.preparationInstructions,
        synonyms: wasteType.synonyms,
        order,
      },
    });

    if (existing) updated++;
    else inserted++;
  }

  console.log(
    `✓ Tipos de resíduo: ${inserted} inseridos, ${updated} atualizados`,
  );
}

async function main() {
  console.log("Iniciando seed...");
  await seedAdmin();
  await seedWasteTypes();
  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
