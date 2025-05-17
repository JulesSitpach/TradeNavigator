import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types for our saved analyses
export interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  formData: any;
  results: any;
}

interface SavedAnalysesProps {
  currentResults: any;
  currentFormData: any;
  onLoadAnalysis: (analysis: SavedAnalysis) => void;
}

const SavedAnalyses = ({ currentResults, currentFormData, onLoadAnalysis }: SavedAnalysesProps) => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [saveName, setSaveName] = useState("");

  // Load saved analyses from local storage on mount
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
  }, []);

  // Save current analysis
  const saveAnalysis = () => {
    if (!currentResults) {
      alert("Please calculate a cost breakdown first");
      return;
    }

    if (!saveName.trim()) {
      alert("Please enter a name for this analysis");
      return;
    }

    if (!currentFormData) {
      alert("No form data available to save");
      return;
    }
    
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toISOString(),
      formData: currentFormData,
      results: currentResults
    };
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    setSaveName("");
    alert("Analysis saved successfully!");
  };

  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedSavedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    alert("Analysis deleted!");
  };

  return (
    <div className="space-y-6">
      {/* Save Analysis Form */}
      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardHeader className="px-4 py-3 border-b border-neutral-200">
          <CardTitle className="text-md font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" />
              <path d="M8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
            </svg>
            Save Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">Save this breakdown to reference later or share with your team</p>
            <Input
              placeholder="Analysis name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={saveAnalysis}
              disabled={!currentResults}
            >
              Save Breakdown
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Saved Analyses List */}
      {savedAnalyses.length > 0 && (
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="px-4 py-3 border-b border-neutral-200">
            <CardTitle className="text-md font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Saved Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {savedAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{analysis.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(analysis.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onLoadAnalysis(analysis)}
                        className="text-blue-600 border-blue-600 text-xs"
                      >
                        Load
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteAnalysis(analysis.id)}
                        className="text-red-600 border-red-600 text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedAnalyses;