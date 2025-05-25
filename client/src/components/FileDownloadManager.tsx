import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMasterTranslation } from '@/utils/masterTranslation';
import { Download, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FileDownloadProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  onDownloadComplete?: () => void;
}

interface FileSecurityConfig {
  maxFileSize: number;
  allowedExtensions: string[];
  virusScanRequired: boolean;
  encryptionLevel: 'none' | 'standard' | 'high';
}

export function FileDownloadManager({ fileName, fileSize, fileType, downloadUrl, onDownloadComplete }: FileDownloadProps) {
  const { t } = useMasterTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [securityValidation, setSecurityValidation] = useState<'pending' | 'valid' | 'invalid'>('pending');

  const securityConfig: FileSecurityConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedExtensions: ['.pdf', '.xlsx', '.docx', '.csv', '.txt', '.zip'],
    virusScanRequired: true,
    encryptionLevel: 'standard'
  };

  const validateFile = (): boolean => {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    
    if (fileSize > securityConfig.maxFileSize) {
      return false;
    }
    
    if (!securityConfig.allowedExtensions.includes(extension)) {
      return false;
    }
    
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadRequest = () => {
    const isValid = validateFile();
    setSecurityValidation(isValid ? 'valid' : 'invalid');
    setShowConfirmation(true);
  };

  const triggerSecureDownload = async () => {
    if (securityValidation !== 'valid') return;
    
    setDownloadStatus('downloading');
    
    try {
      // Create secure download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadStatus('success');
      setTimeout(() => {
        setShowConfirmation(false);
        setDownloadStatus('idle');
        onDownloadComplete?.();
      }, 2000);
      
    } catch (error) {
      setDownloadStatus('error');
      console.error('Download failed:', error);
    }
  };

  const getSecurityBadgeColor = () => {
    switch (securityValidation) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Button
        onClick={handleDownloadRequest}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download className="w-4 h-4" />
        {t('common.download')}
      </Button>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('files.downloadConfirmation')}
            </DialogTitle>
            <DialogDescription>
              {t('files.confirmDownloadMessage')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Information */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{t('files.fileName')}:</span>
                <span className="text-sm text-gray-600">{fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('files.fileSize')}:</span>
                <span className="text-sm text-gray-600">{formatFileSize(fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('files.fileType')}:</span>
                <span className="text-sm text-gray-600">{fileType}</span>
              </div>
            </div>

            {/* Security Status */}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">{t('files.securityStatus')}:</span>
              <Badge className={getSecurityBadgeColor()}>
                {securityValidation === 'valid' && (
                  <><CheckCircle className="w-3 h-3 mr-1" /> {t('files.secure')}</>
                )}
                {securityValidation === 'invalid' && (
                  <><AlertTriangle className="w-3 h-3 mr-1" /> {t('files.blocked')}</>
                )}
                {securityValidation === 'pending' && t('files.validating')}
              </Badge>
            </div>

            {/* Security Alerts */}
            {securityValidation === 'invalid' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {fileSize > securityConfig.maxFileSize 
                    ? t('files.fileTooLarge')
                    : t('files.fileTypeNotAllowed')
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Download Status */}
            {downloadStatus === 'downloading' && (
              <Alert>
                <Download className="h-4 w-4 animate-pulse" />
                <AlertDescription>{t('files.downloading')}</AlertDescription>
              </Alert>
            )}

            {downloadStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {t('files.downloadSuccess')}
                </AlertDescription>
              </Alert>
            )}

            {downloadStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {t('files.downloadError')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={downloadStatus === 'downloading'}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={triggerSecureDownload}
              disabled={securityValidation !== 'valid' || downloadStatus === 'downloading'}
              className="flex items-center gap-2"
            >
              {downloadStatus === 'downloading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('files.downloading')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('files.confirmDownload')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}