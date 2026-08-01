import {
  planRemindersForTask,
  urgencyForDaysLeft,
} from '@features/notifications/domain/notificationPlanner';

// "Ahora" fijo: 2026-03-01 08:00 local.
const NOW = new Date(2026, 2, 1, 8, 0, 0);

describe('urgencyForDaysLeft', () => {
  it('clasifica por días restantes', () => {
    expect(urgencyForDaysLeft(-1)).toBe('overdue');
    expect(urgencyForDaysLeft(0)).toBe('today');
    expect(urgencyForDaysLeft(1)).toBe('tomorrow');
    expect(urgencyForDaysLeft(3)).toBe('soon');
    expect(urgencyForDaysLeft(7)).toBe('far');
  });
});

describe('planRemindersForTask', () => {
  const base = {
    taskId: 't1',
    title: 'Entregar informe',
    subjectName: 'Cálculo',
    status: 'pending',
  };

  it('no programa nada sin fecha de entrega', () => {
    expect(planRemindersForTask({ ...base, dueDate: undefined }, NOW)).toEqual([]);
  });

  it('no programa nada si la tarea está hecha', () => {
    expect(
      planRemindersForTask({ ...base, dueDate: '2026-03-05', status: 'done' }, NOW),
    ).toEqual([]);
  });

  it('programa un recordatorio por día en la ventana previa (futuros)', () => {
    // Vence en 4 días (2026-03-05). Ventana de 7 → offsets 4..0 son futuros.
    const plans = planRemindersForTask({ ...base, dueDate: '2026-03-05' }, NOW);
    expect(plans).toHaveLength(5);
    // El primero (offset 4) es 'far'; el último (offset 0) es 'today'.
    expect(plans[0].urgency).toBe('far');
    expect(plans[plans.length - 1].urgency).toBe('today');
    // ids deterministas
    expect(plans.map(p => p.id)).toContain('t1-0');
    expect(plans.map(p => p.id)).toContain('t1-4');
  });

  it('todos los timestamps son futuros y a las 9:00', () => {
    const plans = planRemindersForTask({ ...base, dueDate: '2026-03-10' }, NOW);
    for (const p of plans) {
      expect(p.timestamp).toBeGreaterThan(NOW.getTime());
      expect(new Date(p.timestamp).getHours()).toBe(9);
    }
  });

  it('escala la urgencia a medida que se acerca', () => {
    const plans = planRemindersForTask({ ...base, dueDate: '2026-03-03' }, NOW);
    const byId = Object.fromEntries(plans.map(p => [p.id, p.urgency]));
    expect(byId['t1-0']).toBe('today');
    expect(byId['t1-1']).toBe('tomorrow');
    expect(byId['t1-2']).toBe('soon');
  });

  describe('aviso inmediato cuando ya se perdió el del día', () => {
    // 3 PM: el recordatorio de las 9 AM de hoy ya pasó.
    const TARDE = new Date(2026, 2, 1, 15, 0, 0);

    it('avisa al crear una tarea que vence mañana pasada la hora del aviso', () => {
      const plans = planRemindersForTask({ ...base, dueDate: '2026-03-02' }, TARDE);
      const now = plans.find(p => p.id === 't1-now');
      expect(now).toBeDefined();
      expect(now!.urgency).toBe('tomorrow');
      expect(now!.timestamp).toBeGreaterThan(TARDE.getTime());
      // El del día de entrega (9 AM de mañana) sigue programado.
      expect(plans.map(p => p.id)).toContain('t1-0');
    });

    it('avisa al crear una tarea que vence hoy', () => {
      const plans = planRemindersForTask({ ...base, dueDate: '2026-03-01' }, TARDE);
      expect(plans.map(p => p.id)).toEqual(['t1-now']);
      expect(plans[0].urgency).toBe('today');
    });

    it('marca como vencida una tarea con fecha pasada', () => {
      const plans = planRemindersForTask({ ...base, dueDate: '2026-02-25' }, TARDE);
      expect(plans).toHaveLength(1);
      expect(plans[0].urgency).toBe('overdue');
    });

    it('no duplica si el aviso del día aún no ha llegado', () => {
      // 8 AM: el recordatorio de las 9 AM de hoy sigue siendo futuro.
      const plans = planRemindersForTask({ ...base, dueDate: '2026-03-02' }, NOW);
      expect(plans.map(p => p.id)).not.toContain('t1-now');
    });

    it('no avisa por tareas fuera de la ventana de 7 días', () => {
      const plans = planRemindersForTask({ ...base, dueDate: '2026-04-01' }, TARDE);
      expect(plans.map(p => p.id)).not.toContain('t1-now');
    });
  });
});
