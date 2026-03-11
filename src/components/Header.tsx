import React, { useState } from 'react';
import { UserRecord, AppSettings } from '../types';
import { LogOut, Settings, ShoppingBag, Image, Video, Layers, Wand2, BadgeCheck, Maximize, Lock, Scissors, Menu, X as CloseIcon } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
  isAdmin: boolean;
  currentUser: UserRecord | null;
  settings: AppSettings | null;
  onAdminToggle: () => void;
  onLogout: () => void;
  isAdminOpen: boolean;
  onBatchOpen: () => void;
  onStoreOpen: () => void;
  onConverterOpen: () => void;
  onImageConverterOpen: () => void;
  onImageEditorOpen: () => void;
  onImageMatcherOpen: () => void;
  onCropperOpen: () => void;
  onSvgaExOpen: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLogoClick,
  isAdmin,
  currentUser,
  settings,
  onAdminToggle,
  onLogout,
  isAdminOpen,
  onBatchOpen,
  onStoreOpen,
  onConverterOpen,
  onImageConverterOpen,
  onImageEditorOpen,
  onImageMatcherOpen,
  onCropperOpen,
  onSvgaExOpen,
  onLoginClick,
  onProfileClick,
  currentTab
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'svga', label: 'SVGA Editor', icon: <Layers className="w-4 h-4" />, onClick: onLogoClick },
    { 
      id: 'svga-ex', 
      label: 'SVGA Editor EX', 
      icon: <Layers className="w-4 h-4" />, 
      onClick: () => {
        if (!currentUser?.hasSvgaExAccess && !isAdmin) {
          alert("عذراً، هذه الميزة مغلقة لحسابك. يرجى التواصل مع الإدارة لتفعيلها.");
          return;
        }
        onSvgaExOpen();
      },
      variant: 'red' as const,
      locked: !currentUser?.hasSvgaExAccess && !isAdmin,
      show: settings?.isSvgaExEnabled || currentUser?.hasSvgaExAccess || isAdmin
    },
    { id: 'converter', label: 'Video Converter', icon: <Video className="w-4 h-4" />, onClick: onConverterOpen },
    { id: 'image-converter', label: 'Image to SVGA', icon: <Image className="w-4 h-4" />, onClick: onImageConverterOpen },
    { id: 'batch', label: 'Batch Compress', icon: <Layers className="w-4 h-4" />, onClick: onBatchOpen },
    { id: 'image-editor', label: 'Image Editor', icon: <Wand2 className="w-4 h-4" />, onClick: onImageEditorOpen },
    { id: 'image-matcher', label: 'Image Matcher', icon: <Maximize className="w-4 h-4" />, onClick: onImageMatcherOpen },
    { id: 'cropper', label: 'Batch Cropper', icon: <Scissors className="w-4 h-4" />, onClick: onCropperOpen },
    { id: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4" />, onClick: onStoreOpen },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 z-50 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Side: Logout (Mobile) or Logo (Desktop) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {currentUser && (
          <button
            onClick={onLogout}
            className="md:hidden p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
        
        {/* Desktop Logo */}
        <button onClick={onLogoClick} className="hidden md:flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              {settings?.appName || 'SVGA Studio'}
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Professional Tools</span>
          </div>
        </button>
      </div>

      {/* Center: Mobile Logo or Desktop Navigation */}
      <div className="flex-1 flex justify-center md:justify-start md:ml-8">
        {/* Mobile Logo */}
        <button onClick={onLogoClick} className="md:hidden flex flex-col items-center group">
          <h1 className="text-xs font-bold text-white tracking-tight truncate max-w-[120px]">
            {settings?.appName || 'SVGA Studio'}
          </h1>
          <span className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">Professional Tools</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.filter(item => item.show !== false).map(item => (
            <NavButton 
              key={item.id}
              active={currentTab === item.id} 
              onClick={item.onClick} 
              icon={item.icon}
              label={item.label}
              variant={item.variant}
              locked={item.locked}
            />
          ))}
        </nav>
      </div>

      {/* Right Side: User Actions & Mobile Menu Button */}
      <div className="flex items-center gap-1 sm:gap-3">
        {currentUser ? (
          <>
            {isAdmin && (
              <button
                onClick={onAdminToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isAdminOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-1 sm:gap-3 pl-1 sm:pl-3 md:border-l border-white/10">
              {/* Profile Icon */}
              <button 
                onClick={onProfileClick}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <span className="text-xs font-bold text-indigo-400">{currentUser.name.charAt(0).toUpperCase()}</span>
                </div>
              </button>

              {/* Desktop Logout */}
              <button
                onClick={onLogout}
                className="hidden md:flex p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-medium rounded-lg border border-white/10 transition-all"
          >
            تسجيل الدخول
          </button>
        )}

        {/* Mobile Menu Button (Right) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-[#020617]/95 backdrop-blur-xl z-[100] animate-in slide-in-from-right duration-300 md:hidden overflow-y-auto">
          <div className="p-6 flex flex-col gap-3">
            <div className="mb-4">
              <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2">جميع الوظائف</h2>
              <div className="grid grid-cols-1 gap-2">
                {navItems.filter(item => item.show !== false).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all active:scale-95 ${
                      currentTab === item.id 
                        ? item.variant === 'red'
                          ? 'bg-[#ff0000] text-black shadow-glow-red'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTab === item.id ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex-1 text-right">
                      <span className="block">{item.label}</span>
                      {item.locked && <span className="text-[10px] text-amber-500 font-medium">ميزة مقفولة</span>}
                    </div>
                    {item.locked && <Lock className="w-4 h-4 text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>
            
            {currentUser && (
              <div className="mt-4 pt-6 border-t border-white/10">
                <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2">الحساب</h2>
                <button
                  onClick={() => {
                    onProfileClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 p-4 w-full bg-white/5 rounded-2xl border border-white/5"
                >
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                    <span className="text-lg font-bold text-indigo-400">{currentUser.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-4 flex items-center justify-center gap-2 p-4 w-full bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'red';
  locked?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, variant = 'default', locked = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
      active 
        ? variant === 'red' 
          ? 'bg-[#ff0000] text-black shadow-glow-red'
          : 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' 
        : variant === 'red'
          ? 'bg-[#ff0000] text-black hover:bg-red-600'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className={variant === 'red' ? 'text-black font-black' : ''}>{label}</span>
    {locked && (
        <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-white/10">
            <Lock className="w-2.5 h-2.5 text-amber-500" />
        </div>
    )}
  </button>
);
