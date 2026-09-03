import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import YAML from 'yaml';

const additions = {
  '/move/visa/': {
    aliases: ['Виза и въезд'],
    when: ['нужно понять требования въезда'],
  },
  '/move/housing/': {
    aliases: ['Жилье и аренда'],
  },
  '/move/finance/': {
    aliases: ['Финансы и переводы'],
  },
  '/move/travel/': {
    aliases: ['Путешествие в Сербию'],
  },
  '/lifestyle/culture/kum/': {
    aliases: ['Кум (крёстный)'],
  },
  '/lifestyle/fun/': {
    aliases: ['Досуг и развлечения'],
  },
  '/map/upravazastrance/': {
    aliases: ['Управа за странце (Управа за иностранцев)'],
    when: ['регистрация как иностранца'],
  },
  '/adaptation/communication/': {
    aliases: ['этикет в учреждениях'],
  },
  '/adaptation/birth/clinics/': {
    aliases: ['роды в Белграде'],
  },
  '/integration/passport/': {
    aliases: ['получение гражданства'],
    when: ['нужно понять процедуру гражданства'],
  },
  '/integration/law_changes_2024/': {
    aliases: ['миграционная реформа 2024', 'изменения Закона об иностранцах'],
  },
  '/move/': {
    aliases: ['переезд в Сербию'],
  },
  '/move/travel/turkey/': {
    aliases: ['перелёт через Турцию'],
  },
  '/move/pets/': {
    aliases: ['перевозка птицы', 'поездка с питомцем в ЕС'],
  },
  '/med/doctors/': {
    aliases: ['русский врач'],
  },
  '/lifestyle/familiar-foods/': {
    aliases: ['где купить творог', 'где купить гречку', 'где купить селёдку'],
  },
  '/lifestyle/culture/books/': {
    aliases: ['книги на русском в Белграде'],
    when: ['нужен книжный или читательский клуб в Белграде'],
  },
  '/gov/lawyer/': {
    aliases: ['адвокатский тариф', 'бесплатный адвокат'],
    when: ['нужен русскоговорящий юрист или адвокат', 'нужно проверить адвокатский тариф и стоимость услуг'],
  },
  '/edu/school/enrollment/': {
    aliases: ['нострификация школьных документов'],
  },
  '/edu/school/resources/': {
    aliases: ['школьные олимпиады'],
    when: ['нужно понять порядок действий при школьном насилии'],
  },
  '/en/foreigner-residence-registration/': {
    aliases: ['landlord guide eUprava'],
  },
  '/arrival/boravak/change-address/': {
    aliases: ['переезд с РВП'],
  },
  '/integration/stalni/change-address/': {
    aliases: ['смена места жительства ПМЖ'],
  },
  '/gov/taxes/': {
    aliases: ['налоговые платежи'],
  },
  '/gov/taxes/personal/foreign-income/': {
    aliases: ['зарубежный доход Сербия'],
  },
  '/gov/taxes/overpayment/': {
    aliases: ['перенос налогового платежа', 'возврат переплаты'],
    when: ['нужно перенести переплату между налоговыми счетами'],
  },
  '/404/': {
    aliases: ['ошибка 404'],
  },
  '/about/app/': {
    aliases: ['RSLive офлайн'],
    when: ['нужно понять, как установить RSLive как приложение'],
  },
  '/sr/user/petro/': {
    aliases: ['профиль Petro'],
  },
  '/gov/taxes/business/dividends/': {
    tags: ['иностранный доход'],
  },
  '/arrival/beli-karton/': {
    when: ['нужен документ о месте жительства'],
  },
  '/arrival/bank/': {
    when: ['нужно открыть банковский счёт'],
  },
  '/arrival/bank/adriatic/': {
    when: ['нужен счёт без РВП'],
  },
  '/adaptation/birth/after/': {
    when: ['нужно оформить документы новорождённого', 'нужны патронаж и педиатр'],
  },
  '/integration/stalni/': {
    when: ['планируешь подавать на постоянное проживание'],
  },
  '/integration/social/': {
    when: ['нужна медицинская страховка'],
  },
  '/lifestyle/history/yugoslavia/': {
    when: ['нужно понять сербский взгляд на распад Югославии'],
  },
  '/map/ruskadusa/': {
    when: ['ищешь русские товары'],
  },
  '/sr/about/': {
    when: ['нужны принципы проекта на сербском'],
  },
  '/arrival/boravak/volontiranje/nof/': {
    when: ['нужно проверить NOF как организатора волонтёрства'],
  },
  '/gov/taxes/business/': {
    when: ['нужно выбрать между налогами preduzetnik и DOO'],
  },
  '/gov/taxes/personal/annual-income/': {
    when: ['нужен порог и вычеты годового налога'],
  },
  '/lifestyle/travel/rtanj/': {
    when: ['планируешь подъём на Ртань или вершину Шиляк'],
  },
};

const replacements = {
  '/map/smallrf/': {
    tags: [],
    aliases: ['Маленькая РФ'],
    when: ['ищешь русские заведения или сервисы в Белграде'],
  },
};

function routeToFile(route) {
  if (route === '/') return 'src/content/docs/index.mdx';
  if (route === '/404/') return 'src/content/docs/404.mdx';
  return path.posix.join('src/content/docs', route.slice(1), 'index.mdx');
}

function unique(values) {
  const result = [];
  const seen = new Set();
  for (const value of values ?? []) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const normalized = value.trim();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function parseFrontmatter(source, file) {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') throw new Error(`${file}: missing frontmatter`);
  let closing = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (['---', '...'].includes(lines[i].trim())) {
      closing = i;
      break;
    }
  }
  if (closing < 0) throw new Error(`${file}: unclosed frontmatter`);
  const text = lines.slice(1, closing).join('\n');
  const data = YAML.parse(text) ?? {};
  return { lines, closing, data };
}

function renderLinking(linking) {
  const lines = ['linking:'];
  for (const [key, values] of [['tags', linking.tags], ['aliases', linking.aliases], ['when', linking.when]]) {
    if (!values?.length) continue;
    lines.push(`  ${key}:`);
    for (const value of values) lines.push(`    - ${JSON.stringify(value)}`);
  }
  return lines;
}

function replaceLinkingBlock(lines, closing, linking) {
  let start = -1;
  let end = -1;
  for (let i = 1; i < closing; i += 1) {
    if (/^linking:\s*$/.test(lines[i])) {
      start = i;
      end = i + 1;
      while (end < closing && (/^\s+/.test(lines[end]) || lines[end].trim() === '')) end += 1;
      break;
    }
  }
  const block = renderLinking(linking);
  if (start >= 0) return [...lines.slice(0, start), ...block, ...lines.slice(end)];
  return [...lines.slice(0, closing), ...block, ...lines.slice(closing)];
}

async function updateRoute(route, spec, replace = false) {
  const file = routeToFile(route);
  const source = await readFile(file, 'utf8');
  const { lines, closing, data } = parseFrontmatter(source, file);
  const current = data.linking && typeof data.linking === 'object' && !Array.isArray(data.linking) ? data.linking : {};
  const next = replace
    ? {
        tags: unique(spec.tags),
        aliases: unique(spec.aliases),
        when: unique(spec.when),
      }
    : {
        tags: unique([...(current.tags ?? []), ...(spec.tags ?? [])]),
        aliases: unique([...(current.aliases ?? []), ...(spec.aliases ?? [])]),
        when: unique([...(current.when ?? []), ...(spec.when ?? [])]),
      };

  if (next.tags.length === 0 && next.aliases.length === 0 && next.when.length === 0) throw new Error(`${route}: empty linking`);

  const newLines = replaceLinkingBlock(lines, closing, next);
  const output = `${newLines.join('\n').replace(/\n*$/, '')}\n`;
  if (output !== source) {
    await writeFile(file, output, 'utf8');
    console.log(`updated ${file}`);
  }
}

for (const [route, spec] of Object.entries(additions)) await updateRoute(route, spec, false);
for (const [route, spec] of Object.entries(replacements)) await updateRoute(route, spec, true);
