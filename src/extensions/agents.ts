import * as fs from 'fs';
import * as path from 'path';
import { Rule, Rules } from '../types';
import { state } from '../state';
import { logger } from '../logger/logger';

export class Agents {
  static loadRules(): Rules {
    const custom: Rule[] = [];
    const byName = new Map<string, Rule[]>();

    for (const rulePath of state.completion.customRules) {
      try {
        const rules = this.loadRulesFromDirectory(rulePath);
        custom.push(...rules);
        this.addRulesByName(byName, rules);
      } catch (err) {
        logger.warn('Failed to load rules from', rulePath, err);
      }
    }

    return { custom, byName };
  }

  private static loadRulesFromDirectory(dirPath: string): Rule[] {
    const rules: Rule[] = [];

    if (!fs.existsSync(dirPath)) {
      return rules;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(dirPath, entry.name, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          rules.push({
            name: entry.name,
            path: skillPath,
          });
        }
      }
    }

    return rules;
  }

  private static addRulesByName(map: Map<string, Rule[]>, rules: Rule[]): void {
    for (const rule of rules) {
      const existing = map.get(rule.name) || [];
      existing.push(rule);
      map.set(rule.name, existing);
    }
  }

  static findRules(rules: Rules, haystack: string): Rule[] {
    const out: Rule[] = [];
    const pattern = /@(\S+)/g;
    let match;

    while ((match = pattern.exec(haystack)) !== null) {
      const ruleName = match[1];
      const foundRules = rules.byName.get(ruleName);
      if (foundRules) {
        out.push(...foundRules);
      }
    }

    return out;
  }

  static getRuleByPath(rules: Rules, rulePath: string): Rule | null {
    for (const rule of rules.custom) {
      if (rule.path === rulePath) {
        return rule;
      }
    }
    return null;
  }

  static rulesToItems(rules: Rules): Rule[] {
    return [...rules.custom];
  }
}
