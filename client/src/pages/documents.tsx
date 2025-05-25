import { Navigation } from "@/components/Navigation";
import { FileDownloadManager } from "@/components/FileDownloadManager";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Download, Clock } from "lucide-react";

interface TradeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  downloadUrl: string;
  category: 'customs' | 'shipping' | 'compliance' | 'certificate';
  lastUpdated: string;
  securityLevel: 'standard' | 'high';
}

export default function Documents() {
  const { t } = useMasterTranslation();

  // Sample trade documents for Mexico/Canada business
  const tradeDocuments: TradeDocument[] = [
    {
      id: '1',
      name: 'USMCA_Certificate_Origin.pdf',
      type: 'PDF',
      size: 2.4 * 1024 * 1024, // 2.4 MB
      downloadUrl: '/api/documents/usmca-certificate.pdf',
      category: 'certificate',
      lastUpdated: '2025-05-25',
      securityLevel: 'high'
    },
    {
      id: '2', 
      name: 'Mexico_Import_Regulations.xlsx',
      type: 'Excel',
      size: 1.8 * 1024 * 1024, // 1.8 MB
      downloadUrl: '/api/documents/mexico-regulations.xlsx',
      category: 'compliance',
      lastUpdated: '2025-05-24',
      securityLevel: 'standard'
    },
    {
      id: '3',
      name: 'Canada_Customs_Declaration.pdf',
      type: 'PDF', 
      size: 950 * 1024, // 950 KB
      downloadUrl: '/api/documents/canada-customs.pdf',
      category: 'customs',
      lastUpdated: '2025-05-25',
      securityLevel: 'high'
    },
    {
      id: '4',
      name: 'Shipping_Manifest_Template.docx',
      type: 'Word',
      size: 1.2 * 1024 * 1024, // 1.2 MB
      downloadUrl: '/api/documents/shipping-manifest.docx',
      category: 'shipping',
      lastUpdated: '2025-05-23',
      securityLevel: 'standard'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      customs: 'bg-blue-100 text-blue-800',
      shipping: 'bg-green-100 text-green-800', 
      compliance: 'bg-orange-100 text-orange-800',
      certificate: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSecurityBadge = (level: string) => {
    return level === 'high' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('documents.title')}</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            {t('documents.subtitle')}
          </p>
        </div>
      </div>

      {/* Document Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradeDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getCategoryColor(doc.category)}>
                      {t(`documents.categories.${doc.category}`)}
                    </Badge>
                    <Badge className={getSecurityBadge(doc.securityLevel)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {doc.securityLevel === 'high' ? t('files.highSecurity') : t('files.standardSecurity')}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {t(`documents.descriptions.${doc.category}`)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('files.fileType')}: {doc.type}</span>
                    <span>{t('files.fileSize')}: {(doc.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{t('documents.lastUpdated')}: {doc.lastUpdated}</span>
                  </div>
                  
                  <div className="pt-2">
                    <FileDownloadManager
                      fileName={doc.name}
                      fileSize={doc.size}
                      fileType={doc.type}
                      downloadUrl={doc.downloadUrl}
                      onDownloadComplete={() => console.log(`Downloaded: ${doc.name}`)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}