// Settings Page
export class SettingsPage {
    constructor() {
        this.container = null;
        this.settings = {};
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'settings-page';
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Settings</h1>
                <p class="page-subtitle">Customize your StudyFlow experience</p>
            </div>
            
            <div class="settings-container">
                <div class="settings-section">
                    <h3 class="section-title">Appearance</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Theme</div>
                            <div class="setting-description">Choose between light and dark mode</div>
                        </div>
                        <div class="setting-control">
                            <select class="form-select" id="setting-theme" onchange="settingsPage.updateSetting('theme', this.value)">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Accent Color</div>
                            <div class="setting-description">Choose your preferred accent color</div>
                        </div>
                        <div class="setting-control">
                            <div class="color-picker">
                                <div class="color-picker-item selected" data-color="default" style="background: #8B7355;" onclick="settingsPage.selectAccentColor(this, 'default')"></div>
                                <div class="color-picker-item" data-color="blue" style="background: #5B8C9F;" onclick="settingsPage.selectAccentColor(this, 'blue')"></div>
                                <div class="color-picker-item" data-color="green" style="background: #5B8C5A;" onclick="settingsPage.selectAccentColor(this, 'green')"></div>
                                <div class="color-picker-item" data-color="purple" style="background: #8B6B9F;" onclick="settingsPage.selectAccentColor(this, 'purple')"></div>
                                <div class="color-picker-item" data-color="orange" style="background: #C47A4A;" onclick="settingsPage.selectAccentColor(this, 'orange')"></div>
                                <div class="color-picker-item" data-color="pink" style="background: #C47A8B;" onclick="settingsPage.selectAccentColor(this, 'pink')"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Font Size</div>
                            <div class="setting-description">Adjust the text size</div>
                        </div>
                        <div class="setting-control">
                            <select class="form-select" id="setting-font-size" onchange="settingsPage.updateSetting('fontSize', this.value)">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="section-title">Focus Timer</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Focus Duration (minutes)</div>
                            <div class="setting-description">Length of focus sessions</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" class="form-input" id="setting-focus-duration" value="25" min="1" max="60" onchange="settingsPage.updateFocusSetting('focusDuration', this.value)">
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Short Break (minutes)</div>
                            <div class="setting-description">Length of short breaks</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" class="form-input" id="setting-short-break" value="5" min="1" max="30" onchange="settingsPage.updateFocusSetting('shortBreakDuration', this.value)">
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Long Break (minutes)</div>
                            <div class="setting-description">Length of long breaks</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" class="form-input" id="setting-long-break" value="15" min="1" max="60" onchange="settingsPage.updateFocusSetting('longBreakDuration', this.value)">
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Sessions before long break</div>
                            <div class="setting-description">Number of focus sessions before a long break</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" class="form-input" id="setting-sessions-before-break" value="4" min="2" max="10" onchange="settingsPage.updateFocusSetting('sessionsBeforeLongBreak', this.value)">
                        </div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="section-title">Preferences</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Notifications</div>
                            <div class="setting-description">Enable desktop notifications</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="setting-notifications" onchange="settingsPage.updateSetting('notifications', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Sound Effects</div>
                            <div class="setting-description">Play sounds for notifications and timer</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="setting-sound" onchange="settingsPage.updateSetting('soundEnabled', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Auto-save</div>
                            <div class="setting-description">Automatically save changes</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="setting-autosave" onchange="settingsPage.updateSetting('autoSave', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="section-title">Data Management</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Export Data</div>
                            <div class="setting-description">Download all your data as JSON</div>
                        </div>
                        <div class="setting-control">
                            <button class="btn btn-secondary" onclick="settingsPage.exportData()">Export</button>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Import Data</div>
                            <div class="setting-description">Restore data from a backup file</div>
                        </div>
                        <div class="setting-control">
                            <button class="btn btn-secondary" onclick="settingsPage.importData()">Import</button>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label" style="color: var(--color-error);">Clear All Data</div>
                            <div class="setting-description">Permanently delete all your data</div>
                        </div>
                        <div class="setting-control">
                            <button class="btn btn-secondary" style="color: var(--color-error);" onclick="settingsPage.clearAllData()">Clear Data</button>
                        </div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="section-title">About</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Version</div>
                            <div class="setting-description">StudyFlow v1.0.0</div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Storage Used</div>
                            <div class="setting-description" id="storage-used">Calculating...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        await this.loadSettings();
        this.updateStorageUsed();
    }

    getTitle() {
        return 'Settings';
    }

    async loadSettings() {
        this.settings = await db.getSettings();
        
        // Populate form
        const themeSelect = document.getElementById('setting-theme');
        const fontSizeSelect = document.getElementById('setting-font-size');
        const notificationsCheckbox = document.getElementById('setting-notifications');
        const soundCheckbox = document.getElementById('setting-sound');
        const autosaveCheckbox = document.getElementById('setting-autosave');
        const focusDurationInput = document.getElementById('setting-focus-duration');
        const shortBreakInput = document.getElementById('setting-short-break');
        const longBreakInput = document.getElementById('setting-long-break');
        const sessionsInput = document.getElementById('setting-sessions-before-break');
        
        if (themeSelect) themeSelect.value = this.settings.theme || 'light';
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize || 'medium';
        if (notificationsCheckbox) notificationsCheckbox.checked = this.settings.notifications !== false;
        if (soundCheckbox) soundCheckbox.checked = this.settings.soundEnabled !== false;
        if (autosaveCheckbox) autosaveCheckbox.checked = this.settings.autoSave !== false;
        
        if (focusDurationInput) focusDurationInput.value = this.settings.focusDuration || 25;
        if (shortBreakInput) shortBreakInput.value = this.settings.shortBreakDuration || 5;
        if (longBreakInput) longBreakInput.value = this.settings.longBreakDuration || 15;
        if (sessionsInput) sessionsInput.value = this.settings.sessionsBeforeLongBreak || 4;
        
        // Update accent color selection
        const accent = this.settings.accent || 'default';
        document.querySelectorAll('.color-picker-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.color === accent);
        });
    }

    async updateSetting(key, value) {
        await db.updateSettings({ [key]: value });
        this.settings[key] = value;
        
        // Apply theme
        if (key === 'theme') {
            document.documentElement.setAttribute('data-theme', value);
        }
        
        // Apply accent color
        if (key === 'accent') {
            document.documentElement.setAttribute('data-accent', value);
        }
        
        // Apply font size
        if (key === 'fontSize') {
            document.documentElement.setAttribute('data-font-size', value);
        }
        
        toast.success('Settings updated', 'Your preferences have been saved');
    }

    async updateFocusSetting(key, value) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) return;
        
        await db.updateSettings({ [key]: numValue });
        this.settings[key] = numValue;
        
        toast.success('Settings updated', 'Focus timer settings have been saved');
    }

    selectAccentColor(element, color) {
        document.querySelectorAll('.color-picker-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.updateSetting('accent', color);
    }

    updateStorageUsed() {
        const used = storage.getUsage();
        const usedMB = (used / (1024 * 1024)).toFixed(2);
        const storageEl = document.getElementById('storage-used');
        if (storageEl) {
            storageEl.textContent = `${usedMB} MB used`;
        }
    }

    async exportData() {
        try {
            const data = await db.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Export successful', 'Your data has been downloaded');
        } catch (error) {
            toast.error('Export failed', 'Failed to export data');
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!confirm('This will overwrite all your current data. Are you sure?')) return;
                
                await db.importAllData(data);
                toast.success('Import successful', 'Your data has been restored');
                
                // Reload page to reflect changes
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                toast.error('Import failed', 'Invalid backup file');
            }
        };
        
        input.click();
    }

    async clearAllData() {
        if (!confirm('This will permanently delete ALL your data. This action cannot be undone. Are you sure?')) return;
        if (!confirm('Are you absolutely sure? All your notes, tasks, and settings will be deleted.')) return;
        
        try {
            await db.clearAllData();
            toast.success('Data cleared', 'All data has been deleted');
            
            // Reload page
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error('Error', 'Failed to clear data');
        }
    }
}

// Make it globally accessible
window.settingsPage = new SettingsPage();