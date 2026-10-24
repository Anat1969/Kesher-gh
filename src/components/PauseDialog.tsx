import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { Settings } from '../lib/storage';

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
      <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
        <span>🔊 צלילים</span>
        <Switch dir="ltr" checked={settings.sound} onCheckedChange={sound => onSettings({ sound })} aria-label="צלילים" />
      </label>
      <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
        <span>📳 רטט</span>
        <Switch dir="ltr" checked={settings.haptics} onCheckedChange={haptics => onSettings({ haptics })} aria-label="רטט" />
      </label>
    </div>
  );
}

export default function PauseDialog({ open, settings, onResume, onFinish, onMenu, onSettings }: PauseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onResume(); }}>
      <DialogContent dir="rtl" className="max-w-[340px] rounded-2xl bg-surface-1 border-border text-right">
        <DialogTitle className="font-display text-2xl text-gold-light text-center">⏸ המשחק מושהה</DialogTitle>
        <DialogDescription className="text-center">השעון עצר. אפשר להמשיך מאותה נקודה.</DialogDescription>

        <div className="bg-surface-2 rounded-xl p-4 my-1">
          <SettingsToggles settings={settings} onSettings={onSettings} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="bg-primary text-primary-foreground py-3 rounded-full font-display text-lg font-bold hover:opacity-90 transition"
            autoFocus
          >
            ▶ המשך לשחק
          </button>
          <button
            onClick={onFinish}
            className="border border-border py-2.5 rounded-full text-sm hover:bg-surface-2 transition"
          >
            סיים עכשיו וראה תוצאות
          </button>
          <button
            onClick={onMenu}
            className="py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition"
          >
            חזרה למסך הראשי
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
