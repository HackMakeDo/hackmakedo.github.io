import type { APIContext } from 'astro';
import { markdownResponse } from '../../lib/markdown-page';

export function GET(_context: APIContext) {
  return markdownResponse(`# Umbraco contractor

Warren Buckley is a UK-based Umbraco contractor and nine-time Umbraco MVP, available to join agency and in-house teams.

## 9× Umbraco MVP

First Umbraco MVP award: 2007. 20 years building with Umbraco. Clients and projects include the Council of the European Union.

## Where he works from

Remotely, from the UK.

Contact: warren@hackmakedo.com
`);
}
