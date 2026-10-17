import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Clock,
  ArrowDownCircle,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Terminal,
  Check,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface CommitItem {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface RepoStatusData {
  currentCommit: {
    sha: string;
    fullSha: string;
    message: string;
    author: string;
    date: string;
  };
  remoteCommit: {
    sha: string;
    fullSha: string;
  };
  hasUpdate: boolean;
  commitsBehind: number;
  incomingCommits: CommitItem[];
  incomingFiles: string[];
  fetchError: string | null;
  repoUrl: string;
  branch: string;
  checkedAt: string;
}

interface UpdateResult {
  success: boolean;
  previousSha?: string;
  updatedSha?: string;
  appliedCommits?: CommitItem[];
  changedFiles?: string[];
  steps?: Array<{
    step: string;
    title: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    output?: string;
  }>;
  message?: string;
  error?: string;
}

interface RepoUpdateIndicatorProps {
  variant?: 'header' | 'floating';
}

export const RepoUpdateIndicator: React.FC<RepoUpdateIndicatorProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusData, setStatusData] = useState<RepoStatusData | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadCountdown, setReloadCountdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'files' | 'logs'>('overview');

  const fetchRepoStatus = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiClient('/repo/status');
      if (data) {
        setStatusData(data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch real repo status:', err);
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با مخزن گیت سرور');
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoStatus(false);
    // Periodically check every 60 seconds
    const interval = setInterval(() => {
      if (!isUpdating) {
        fetchRepoStatus(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isUpdating]);

  // Countdown timer for page reload after successful update
  useEffect(() => {
    if (reloadCountdown !== null && reloadCountdown > 0) {
      const timer = setTimeout(() => {
        setReloadCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (reloadCountdown === 0) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }, [reloadCountdown]);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    setErrorMsg(null);
    setUpdateResult(null);

    try {
      const result: UpdateResult = await apiClient('/repo/pull', {
        method: 'POST',
      });

      setUpdateResult(result);
      if (result.success) {
        // Refresh local status data
        fetchRepoStatus(false);
        // Start 5-second reload countdown so user can review the changes
        setReloadCountdown(5);
      } else {
        setErrorMsg(result.error || 'خطا در اعمال به‌روزرسانی مخزن');
      }
    } catch (err: any) {
      console.error('Update execution error:', err);
      setErrorMsg(err.message || 'خطا در اجرای عملیات git pull');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const hasUpdate = Boolean(statusData?.hasUpdate);
  const currentSha = statusData?.currentCommit?.sha || '...';
  const remoteSha = statusData?.remoteCommit?.sha || currentSha;
  const commitsCount = statusData?.commitsBehind || 0;

  const buttonContent = (
    <button
      onClick={() => {
        setIsOpen(true);
        fetchRepoStatus(true);
      }}
      className={`group relative flex items-center gap-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
        hasUpdate
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border border-emerald-400/50 shadow-emerald-500/20'
          : 'bg-slate-900 hover:bg-slate-800 text-white border border-indigo-500/40 hover:border-indigo-400'
      } ${
        variant === 'header'
          ? 'px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs'
          : 'px-3.5 py-2.5 text-xs shadow-2xl rounded-2xl'
      }`}
      title="بررسی و دریافت آخرین تغییرات و کامیت‌های مخزن گیت‌هاب (arkaadia/water)"
    >
      {/* Blinking / Pulsing Beacon */}
      <span className="relative flex h-3 w-3">
        {hasUpdate ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-sm shadow-emerald-300"></span>
          </>
        ) : (
          <>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-2xs shadow-cyan-400"></span>
          </>
        )}
      </span>

      <div className="flex items-center gap-1.5 text-xs font-black">
        <RefreshCw className={`w-3.5 h-3.5 ${hasUpdate ? 'text-white' : 'text-cyan-400'} ${isLoading || isUpdating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        <span className="hidden sm:inline">
          {hasUpdate ? 'کامیت جدید رسید!' : 'آپدیت مخزن'}
        </span>
      </div>

      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
        hasUpdate
          ? 'bg-white text-emerald-900 shadow-xs animate-bounce font-black'
          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
      }`}>
        {hasUpdate ? `${commitsCount} جدید` : currentSha}
      </span>
    </button>
  );

  return (
    <>
      {variant === 'floating' ? (
        <div className="fixed bottom-5 left-5 z-40 flex items-center">
          {buttonContent}
        </div>
      ) : (
        buttonContent
      )}

      {/* Real Git Updater Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 font-black text-lg">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                    <span>همگام‌سازی و آپدیت زنده مخزن</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                      main
                    </span>
                  </h3>
                  <a
                    href={statusData?.repoUrl || 'https://github.com/arkaadia/water'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-0.5 font-mono"
                  >
                    <span>arkaadia/water</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-800 p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success Applied Banner */}
            {updateResult?.success && (
              <div className="bg-emerald-600 text-white p-3.5 text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <div>
                    <div className="font-black text-sm">آپدیت با موفقیت اعمال گردید!</div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      نسخه ارتقا یافت به: <span className="font-mono font-bold bg-emerald-700 px-1 rounded">{updateResult.updatedSha}</span>
                      {reloadCountdown !== null && (
                        <span className="mr-2">· رفرش خودکار در {reloadCountdown} ثانیه...</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleManualReload}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-black px-3 py-1.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>رفرش فوری سایت</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Status Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Current Installed Commit */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block">کامیت نصب‌شده روی سیستم:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {statusData?.currentCommit?.sha || '...'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">HEAD</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium truncate pt-1" title={statusData?.currentCommit?.message}>
                    {statusData?.currentCommit?.message || 'در حال دریافت اطلاعات...'}
                  </p>
                </div>

                {/* Latest on GitHub */}
                <div className={`border rounded-2xl p-3 space-y-1.5 ${
                  hasUpdate
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-bold text-slate-500 block">آخرین کامیت روی گیت‌هاب:</span>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                      hasUpdate
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {remoteSha}
                    </span>
                    {hasUpdate ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full animate-pulse">
                        جدید
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        همگام
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium truncate pt-1">
                    {hasUpdate
                      ? (statusData?.incomingCommits[0]?.message || 'کامیت‌های جدید منتظر اعمال هستند.')
                      : 'سایت با آخرین نسخه گیت‌هاب همگام است.'}
                  </p>
                </div>
              </div>

              {/* Live Update Progress Steps (When updating or finished) */}
              {(isUpdating || updateResult?.steps) && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-2 text-cyan-400">
                      <Terminal className="w-4 h-4" />
                      <span>مراحل اجرای زنده به‌روزرسانی گیت (Live Git Process):</span>
                    </span>
                    {isUpdating && (
                      <span className="text-[10px] text-emerald-400 font-mono animate-pulse">در حال اجرا...</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(updateResult?.steps || [
                      { step: 'fetch', title: 'دریافت آخرین اطلاعات از origin/main (git fetch)', status: 'running' },
                      { step: 'pull', title: 'ادغام تغییرات در سورس‌کد پروژه (git pull)', status: 'pending' },
                      { step: 'deps', title: 'بررسی پکیج‌ها و بازسازی سرویس', status: 'pending' }
                    ]).map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-slate-800/80 p-2.5 rounded-xl text-xs border border-slate-700">
                        <div className="mt-0.5">
                          {s.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : s.status === 'running' ? (
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                          ) : s.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-500 inline-block shrink-0" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold ${
                            s.status === 'completed' ? 'text-emerald-300' : s.status === 'running' ? 'text-cyan-300' : 'text-slate-400'
                          }`}>
                            {s.title}
                          </div>
                          {s.output && (
                            <div className="font-mono text-[10px] text-slate-400 mt-1 bg-black/40 p-1.5 rounded border border-slate-700/50 max-h-16 overflow-y-auto whitespace-pre-wrap">
                              {s.output}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming Commits List */}
              {hasUpdate && statusData?.incomingCommits && statusData.incomingCommits.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>کامیت‌های جدید اضافه شده به مخزن ({statusData.incomingCommits.length} کامیت):</span>
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {statusData.incomingCommits.map((c, i) => (
                      <div key={i} className="bg-white p-2.5 rounded-xl border border-amber-200/70 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                            {c.sha}
                          </span>
                          <span className="text-[10px] text-slate-400">{c.date}</span>
                        </div>
                        <div className="font-bold text-slate-800 text-[11px] leading-relaxed">
                          {c.message}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ثبت شده توسط: <strong className="text-slate-700">{c.author}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming Changed Files */}
              {hasUpdate && statusData?.incomingFiles && statusData.incomingFiles.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-600" />
                    <span>فایل‌های تغییریافته در این نسخه ({statusData.incomingFiles.length} فایل):</span>
                  </span>
                  <div className="max-h-24 overflow-y-auto font-mono text-[10px] text-slate-600 space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                    {statusData.incomingFiles.map((file, idx) => (
                      <div key={idx} className="truncate">
                        • {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When System is Up to Date */}
              {!hasUpdate && !isUpdating && !updateResult?.success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="font-black text-sm text-emerald-900">سامانه با آخرین کامیت مخزن کاملاً همگام است</div>
                  <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                    نسخه فعال روی سرور دقیقاً برابر با آخرین کد موجود در شاخه <span className="font-mono font-bold">main</span> گیت‌هاب می‌باشد.
                  </p>
                </div>
              )}

              {/* Last Checked Timestamp */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>آخرین بررسی اتصال به گیت‌هاب:</span>
                <span className="font-mono font-bold text-slate-600">
                  {statusData?.checkedAt || 'هم‌اکنون'}
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              {hasUpdate ? (
                <button
                  onClick={handleApplyUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <ArrowDownCircle className={`w-4 h-4 ${isUpdating ? 'animate-bounce' : ''}`} />
                  <span>{isUpdating ? 'در حال اجرای عملیات Git Pull...' : 'دریافت و اعمال زنده به‌روزرسانی (Git Pull)'}</span>
                </button>
              ) : (
                <button
                  onClick={handleApplyUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  title="در صورت نیاز به دریافت مجدد فایل‌ها از گیت‌هاب"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span>{isUpdating ? 'در حال همگام‌سازی...' : 'همگام‌سازی اجباری با مخزن (Force Pull)'}</span>
                </button>
              )}

              <button
                onClick={() => fetchRepoStatus(true)}
                disabled={isLoading || isUpdating}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl transition cursor-pointer"
                title="بررسی مجدد آخرین وضعیت گیت‌هاب"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
