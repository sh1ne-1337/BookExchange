import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import { env } from '../config/env.js';
import { EMAIL_TEMPLATES_DIR } from '../config/paths.js';

export type EmailTemplateName = 'exchange-request' | 'password-reset';

const LAYOUT_PARTIAL = 'layout';

const shouldCache = env.NODE_ENV === 'production';
const templateCache = new Map<EmailTemplateName, HandlebarsTemplateDelegate>();
let handlebars: typeof Handlebars | undefined;

function readTemplate(name: string): string {
  return fs.readFileSync(path.join(EMAIL_TEMPLATES_DIR, `${name}.hbs`), 'utf8');
}

function getHandlebars(): typeof Handlebars {
  if (handlebars && shouldCache) return handlebars;

  handlebars = Handlebars.create();
  handlebars.registerPartial(LAYOUT_PARTIAL, readTemplate(LAYOUT_PARTIAL));
  return handlebars;
}

function getTemplate(name: EmailTemplateName): HandlebarsTemplateDelegate {
  const cached = templateCache.get(name);
  if (cached) return cached;

  const template = getHandlebars().compile(readTemplate(name), { strict: true });
  if (shouldCache) templateCache.set(name, template);
  return template;
}

export function renderEmailTemplate(name: EmailTemplateName, context: object): string {
  return getTemplate(name)(context);
}
