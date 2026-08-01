import {
  buildSemesterHistory,
  punctualityOf,
  summarize,
} from '@features/semesters/domain/semesterHistory';
import type { Subject } from '@features/subjects/domain/entities/Subject';
import type { Task } from '@features/tasks/domain/entities/Task';

const TODAY = '2026-06-15';

function task(over: Partial<Task> = {}): Task {
  return {
    id: 't1',
    subjectId: 'subj-1',
    title: 'Tarea',
    status: 'pending',
    priority: 'medium',
    ...over,
  };
}

const subjects: Subject[] = [
  { id: 'subj-1', semesterId: 'sem-1', name: 'Cálculo', color: '#4F46E5' },
  { id: 'subj-2', semesterId: 'sem-1', name: 'Álgebra', color: '#059669' },
  { id: 'subj-3', semesterId: 'sem-1', name: 'Sin tareas', color: '#DC2626' },
];

describe('punctualityOf', () => {
  it('marca a tiempo cuando se completa antes de la entrega', () => {
    const res = punctualityOf(
      task({ status: 'done', dueDate: '2026-06-10', completedAt: '2026-06-08T14:00:00.000Z' }),
    );
    expect(res.punctuality).toBe('on_time');
    expect(res.daysOff).toBe(-2);
  });

  it('cuenta como a tiempo el mismo día de la entrega', () => {
    const res = punctualityOf(
      task({ status: 'done', dueDate: '2026-06-10', completedAt: '2026-06-10T23:50:00.000Z' }),
    );
    expect(res.punctuality).toBe('on_time');
    expect(res.daysOff).toBe(0);
  });

  it('marca tarde y cuántos días', () => {
    const res = punctualityOf(
      task({ status: 'done', dueDate: '2026-06-10', completedAt: '2026-06-13T09:00:00.000Z' }),
    );
    expect(res.punctuality).toBe('late');
    expect(res.daysOff).toBe(3);
  });

  it('no inventa puntualidad sin completed_at (tareas previas a la v3)', () => {
    const res = punctualityOf(task({ status: 'done', dueDate: '2026-06-10' }));
    expect(res.punctuality).toBe('unknown');
    expect(res.daysOff).toBeUndefined();
  });

  it('no inventa puntualidad si la tarea no tiene fecha de entrega', () => {
    expect(
      punctualityOf(task({ status: 'done', completedAt: '2026-06-13T09:00:00.000Z' }))
        .punctuality,
    ).toBe('unknown');
  });
});

describe('summarize', () => {
  it('cuenta estados, vencidas y tasa de avance', () => {
    const totals = summarize(
      [
        task({ id: 'a', status: 'done', dueDate: '2026-06-01', completedAt: '2026-06-05T00:00:00.000Z' }),
        task({ id: 'b', status: 'done', dueDate: '2026-06-01', completedAt: '2026-05-30T00:00:00.000Z' }),
        task({ id: 'c', status: 'in_progress', dueDate: '2026-06-20' }),
        task({ id: 'd', status: 'pending', dueDate: '2026-06-01' }),
      ],
      TODAY,
    );

    expect(totals).toEqual({
      total: 4,
      done: 2,
      pending: 1,
      inProgress: 1,
      overdue: 1, // solo 'd': vencida y sin completar
      late: 1, // solo 'a': completada 4 días tarde
      completionRate: 50,
    });
  });

  it('no divide por cero sin tareas', () => {
    expect(summarize([], TODAY).completionRate).toBe(0);
  });

  it('no cuenta como vencida una tarea sin fecha de entrega', () => {
    expect(summarize([task({ status: 'pending' })], TODAY).overdue).toBe(0);
  });
});

describe('buildSemesterHistory', () => {
  const tasks: Task[] = [
    task({ id: 'a', subjectId: 'subj-1', title: 'Parcial', status: 'done', dueDate: '2026-06-01', completedAt: '2026-06-01T10:00:00.000Z' }),
    task({ id: 'b', subjectId: 'subj-1', title: 'Ensayo', status: 'done', dueDate: '2026-05-20', completedAt: '2026-05-25T10:00:00.000Z' }),
    task({ id: 'c', subjectId: 'subj-1', title: 'Taller', status: 'pending', dueDate: '2026-06-30' }),
    task({ id: 'd', subjectId: 'subj-2', title: 'Quiz', status: 'done', dueDate: '2026-06-10', completedAt: '2026-06-09T10:00:00.000Z' }),
  ];

  it('resume el semestre completo', () => {
    const h = buildSemesterHistory(subjects, tasks, TODAY);
    expect(h.totals.total).toBe(4);
    expect(h.totals.done).toBe(3);
    expect(h.totals.late).toBe(1);
    expect(h.totals.completionRate).toBe(75);
  });

  it('desglosa por materia y omite las que no tienen tareas', () => {
    const h = buildSemesterHistory(subjects, tasks, TODAY);
    expect(h.bySubject.map(b => b.subject.name)).toEqual(['Cálculo', 'Álgebra']);
    expect(h.bySubject[0].totals).toMatchObject({ total: 3, done: 2, late: 1 });
  });

  it('ordena la cronología de más reciente a más antigua', () => {
    const h = buildSemesterHistory(subjects, tasks, TODAY);
    // Quiz 09-jun, Parcial 01-jun, Ensayo 25-may.
    expect(h.timeline.map(e => e.task.title)).toEqual(['Quiz', 'Parcial', 'Ensayo']);
  });

  it('adjunta materia y puntualidad a cada entrada de la cronología', () => {
    const h = buildSemesterHistory(subjects, tasks, TODAY);
    const ensayo = h.timeline.find(e => e.task.title === 'Ensayo');
    expect(ensayo).toMatchObject({
      subjectName: 'Cálculo',
      subjectColor: '#4F46E5',
      punctuality: 'late',
      daysOff: 5,
    });
  });

  it('excluye de la cronología las tareas hechas sin fecha de completado', () => {
    const h = buildSemesterHistory(
      subjects,
      [task({ id: 'x', status: 'done', dueDate: '2026-06-01' })],
      TODAY,
    );
    expect(h.timeline).toHaveLength(0);
    expect(h.totals.done).toBe(1);
  });

  it('devuelve un historial vacío coherente sin datos', () => {
    const h = buildSemesterHistory([], [], TODAY);
    expect(h.bySubject).toHaveLength(0);
    expect(h.timeline).toHaveLength(0);
    expect(h.totals.total).toBe(0);
  });
});
