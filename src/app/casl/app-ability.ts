export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subject = 'all' | string;

interface Rule {
  action: Action | 'manage';
  subject: Subject;
}

export class AppAbility {
  private rules: Rule[] = [];

  can(action: Action, subject: Subject): boolean {
    return this.rules.some(r =>
      (r.action === 'manage' || r.action === action) &&
      (r.subject === 'all'   || r.subject === subject)
    );
  }

  cannot(action: Action, subject: Subject): boolean {
    return !this.can(action, subject);
  }

  allow(action: Action | 'manage', subject: Subject): void {
    this.rules.push({ action, subject });
  }
}

export function buildAbility(_workspace: null): AppAbility {
  const ability = new AppAbility();
  ability.allow('manage', 'all');
  return ability;
}
