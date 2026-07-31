import notifee, {
  AndroidNotificationSetting,
} from '@notifee/react-native';
import { NotifeeNotificationService } from '@features/notifications/data/NotifeeNotificationService';

// El mock global vive en jest.setup.js; aquí se ajusta por caso.
const mock = notifee as unknown as Record<string, jest.Mock>;

const task = {
  taskId: 'task-1',
  title: 'Entregar informe',
  subjectName: 'Cálculo',
  dueDate: '2099-01-10',
  status: 'pending',
};

/** Trigger con el que se programó la notificación número `i`. */
function triggerAt(i: number) {
  return mock.createTriggerNotification.mock.calls[i][1];
}

describe('NotifeeNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.getNotificationSettings.mockResolvedValue({
      authorizationStatus: 1,
      android: { alarm: AndroidNotificationSetting.ENABLED },
    });
    mock.createTriggerNotification.mockResolvedValue('id');
  });

  it('programa con alarma exacta cuando el sistema lo permite', async () => {
    await new NotifeeNotificationService().scheduleForTask(task);

    expect(mock.createTriggerNotification).toHaveBeenCalled();
    expect(triggerAt(0).alarmManager).toEqual({ allowWhileIdle: true });
  });

  it('reintenta pidiendo permiso y degrada a alarma inexacta si falla', async () => {
    // Primer intento: Android rechaza la alarma exacta.
    mock.createTriggerNotification.mockRejectedValueOnce(
      new Error('missing SCHEDULE_EXACT_ALARM'),
    );
    mock.getNotificationSettings.mockResolvedValue({
      authorizationStatus: 1,
      android: { alarm: AndroidNotificationSetting.DISABLED },
    });

    await new NotifeeNotificationService().scheduleForTask(task);

    // Volvió a pedir permiso en el catch...
    expect(mock.requestPermission).toHaveBeenCalledTimes(2);
    // ...y reprogramó sin alarmManager en lugar de perder el recordatorio.
    const retryTrigger = triggerAt(mock.createTriggerNotification.mock.calls.length - 1);
    expect(retryTrigger.alarmManager).toBeUndefined();
    expect(retryTrigger.timestamp).toEqual(expect.any(Number));
  });

  it('no vuelve a pedir permiso más de una vez por sesión', async () => {
    mock.createTriggerNotification.mockRejectedValue(new Error('denegado'));
    const service = new NotifeeNotificationService();

    await service.scheduleForTask(task);
    await service.scheduleForTask({ ...task, taskId: 'task-2' });

    expect(mock.requestPermission).toHaveBeenCalledTimes(2);
  });

  it('reporta el estado de permisos para que la UI pueda avisar', async () => {
    mock.getNotificationSettings.mockResolvedValue({
      authorizationStatus: 1,
      android: { alarm: AndroidNotificationSetting.DISABLED },
    });

    const state = await new NotifeeNotificationService().getPermissionState();

    expect(state).toEqual({ notifications: true, exactAlarms: false });
  });

  it('trata NOT_SUPPORTED como permitido (Android < 12)', async () => {
    mock.getNotificationSettings.mockResolvedValue({
      authorizationStatus: 1,
      android: { alarm: AndroidNotificationSetting.NOT_SUPPORTED },
    });

    const state = await new NotifeeNotificationService().getPermissionState();

    expect(state.exactAlarms).toBe(true);
  });

  it('cancela los recordatorios de una tarea ya entregada sin reprogramar', async () => {
    await new NotifeeNotificationService().scheduleForTask({
      ...task,
      status: 'done',
    });

    expect(mock.cancelTriggerNotification).toHaveBeenCalled();
    expect(mock.createTriggerNotification).not.toHaveBeenCalled();
  });
});
