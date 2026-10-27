import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { Settings } from '../lib/storage';
import ThemeToggle from './ThemeToggle';

interface PauseDialogProps {
  open: boolean;
  settings: Settings;
  onResume: () => void;
  onFinish: () => void;
  onMenu: () => void;
  onSettings: (patch: Partial<Settings>) => void;
}

export function SettingsToggles({ settings, onSettings }: Pick<PauseDialogProps, 'settings' | 'onSettings'>) {
  return (
    <div className="space-y-3">
      <ThemeToggle />
      <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
        <span>צלילים</span>
        <Switch dir="ltr" checked={settings.sound} onCheckedChange={sound => onSettings({ sound })} aria-label="צלילים" />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
        <span>רטט</span>
        <Switch dir="ltr" checked={settings.haptics} onCheckedChange={haptics => onSettings({ haptics })} aria-label="רטט" />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
        <span>שמות על הכרטיסים</span>
        <Switch dir="ltr" checked={settings.labels} onCheckedChange={labels => onSettings({ labels })} aria-label="שמות על הכרטיסים" />
      </label>
    </div>
  );
}

export default function PauseDialog({ open, settings, onResume, onFinish, onMenu, onSettings }: PauseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onResume(); }}>
      <DialogContent dir="rtl" className="panel max-w-[360px] gap-4 border-border p-6 text-right shadow-lg sm:rounded-md">
        <div className="text-center">
          <p className="label-mono mb-2">השעון עצר</p>
          <DialogTitle className="text-3xl font-extralight text-foreground">המשחק מושהה</DialogTitle>
          <DialogDescription className="mt-1.5 text-center">אפשר להמשיך בדיוק מאותה נקודה.</DialogDescription>
        </div>

        <div className="well p-4">
          <SettingsToggles settings={settings} onSettings={onSettings} />
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onResume} className="btn btn-primary h-12 text-base" autoFocus>המשך משחק</button>
          <button onClick={onFinish} className="btn btn-ghost h-11 text-sm">סיים עכשיו וראה תוצאות</button>
          <button onClick={onMenu} className="btn btn-text h-10 text-sm">חזרה לדף הבית</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
