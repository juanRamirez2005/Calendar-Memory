import type { SubjectRow } from '@features/subjects/data/dto/SubjectRow';
import type { SubjectDataSource } from '@features/subjects/data/datasources/SubjectDataSource';
import { SubjectRepositoryImpl } from '@features/subjects/data/repositories/SubjectRepositoryImpl';
import { buildSubjectUseCases } from '@features/subjects/domain/usecases/subjectUseCases';

class InMemorySubjectDataSource implements SubjectDataSource {
  rows: SubjectRow[] = [];

  async insert(row: SubjectRow) {
    this.rows.push({ ...row });
  }
  async selectBySemester(semesterId: string) {
    return this.rows.filter(r => r.semester_id === semesterId).map(r => ({ ...r }));
  }
  async selectById(id: string) {
    const r = this.rows.find(x => x.id === id);
    return r ? { ...r } : null;
  }
  async update(row: SubjectRow) {
    const i = this.rows.findIndex(x => x.id === row.id);
    if (i >= 0) {
      this.rows[i] = { ...row };
    }
  }
  async deleteById(id: string) {
    this.rows = this.rows.filter(r => r.id !== id);
  }
}

function setup() {
  const ds = new InMemorySubjectDataSource();
  const repo = new SubjectRepositoryImpl(ds);
  const uc = buildSubjectUseCases(repo);
  return { ds, repo, uc };
}

const input = {
  semesterId: 'sem-1',
  name: 'Cálculo I',
  color: '#2D6CDF',
};

describe('subjects', () => {
  it('crea y lista materias del semestre', async () => {
    const { uc } = setup();
    await uc.create.execute(input);
    await uc.create.execute({ ...input, name: 'Física', semesterId: 'sem-2' });

    const res = await uc.listBySemester.execute('sem-1');
    expect(res.ok && res.value).toHaveLength(1);
    expect(res.ok && res.value[0].name).toBe('Cálculo I');
  });

  it('rechaza materia sin nombre', async () => {
    const { uc } = setup();
    const res = await uc.create.execute({ ...input, name: '' });
    expect(res.ok).toBe(false);
  });

  it('rechaza materia sin color', async () => {
    const { uc } = setup();
    const res = await uc.create.execute({ ...input, color: '' });
    expect(res.ok).toBe(false);
  });

  it('actualiza una materia', async () => {
    const { uc, repo } = setup();
    const created = await repo.create(input);
    const res = await uc.update.execute(created.id, {
      name: 'Cálculo Diferencial',
      professor: 'Dra. Gómez',
    });
    expect(res.ok && res.value.name).toBe('Cálculo Diferencial');
    expect(res.ok && res.value.professor).toBe('Dra. Gómez');
  });

  it('elimina una materia', async () => {
    const { uc, repo } = setup();
    const created = await repo.create(input);
    await uc.remove.execute(created.id);
    expect(await repo.listBySemester('sem-1')).toHaveLength(0);
  });
});
