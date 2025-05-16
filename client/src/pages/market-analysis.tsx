import { useState } from "react";
import { FaGlobe, FaChartLine, FaFilter, FaDownload } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MarketAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("electronics");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  
  // Sample data for demonstration
  const marketData = {
    electronics: {
      growth: [
        { market: 'United States', growth: 12 },
        { market: 'European Union', growth: 9 },
        { market: 'Japan', growth: 7 },
        { market: 'China', growth: 15 },
        { market: 'Canada', growth: 8 },
        { market: 'Mexico', growth: 10 },
        { market: 'Australia', growth: 6 },
        { market: 'South Korea', growth: 11 }
      ],
      trends: [
        { month: 'Jan', imports: 420, exports: 380 },
        { month: 'Feb', imports: 440, exports: 390 },
        { month: 'Mar', imports: 455, exports: 400 },
        { month: 'Apr', imports: 470, exports: 410 },
        { month: 'May', imports: 480, exports: 420 },
        { month: 'Jun', imports: 490, exports: 430 },
      ],
      competitors: [
        { rank: 1, company: 'TechGlobal Inc.', marketShare: 18, country: 'US' },
        { rank: 2, company: 'Elite Electronics', marketShare: 15, country: 'CN' },
        { rank: 3, company: 'Innovatech', marketShare: 12, country: 'JP' },
        { rank: 4, company: 'DigiCorp', marketShare: 10, country: 'DE' },
        { rank: 5, company: 'SmartTech Solutions', marketShare: 8, country: 'KR' },
      ]
    },
    apparel: {
      growth: [
        { market: 'United States', growth: 8 },
        { market: 'European Union', growth: 7 },
        { market: 'Japan', growth: 5 },
        { market: 'China', growth: 12 },
        { market: 'Canada', growth: 6 },
        { market: 'Mexico', growth: 9 },
        { market: 'Australia', growth: 4 },
        { market: 'South Korea', growth: 7 }
      ],
      trends: [
        { month: 'Jan', imports: 320, exports: 290 },
        { month: 'Feb', imports: 330, exports: 300 },
        { month: 'Mar', imports: 335, exports: 310 },
        { month: 'Apr', imports: 350, exports: 320 },
        { month: 'May', imports: 360, exports: 330 },
        { month: 'Jun', imports: 370, exports: 345 },
      ],
      competitors: [
        { rank: 1, company: 'Fashion Forward', marketShare: 16, country: 'FR' },
        { rank: 2, company: 'StyleCo International', marketShare: 14, country: 'IT' },
        { rank: 3, company: 'Trendsetter Apparel', marketShare: 11, country: 'US' },
        { rank: 4, company: 'Global Garments', marketShare: 9, country: 'CN' },
        { rank: 5, company: 'Fabric Innovators', marketShare: 7, country: 'UK' },
      ]
    },
    furniture: {
      growth: [
        { market: 'United States', growth: 6 },
        { market: 'European Union', growth: 5 },
        { market: 'Japan', growth: 3 },
        { market: 'China', growth: 10 },
        { market: 'Canada', growth: 5 },
        { market: 'Mexico', growth: 7 },
        { market: 'Australia', growth: 4 },
        { market: 'South Korea', growth: 5 }
      ],
      trends: [
        { month: 'Jan', imports: 220, exports: 180 },
        { month: 'Feb', imports: 230, exports: 185 },
        { month: 'Mar', imports: 235, exports: 190 },
        { month: 'Apr', imports: 240, exports: 195 },
        { month: 'May', imports: 250, exports: 200 },
        { month: 'Jun', imports: 260, exports: 210 },
      ],
      competitors: [
        { rank: 1, company: 'Comfort Living', marketShare: 14, country: 'US' },
        { rank: 2, company: 'Home Elegance', marketShare: 12, country: 'IT' },
        { rank: 3, company: 'Modern Furnishings', marketShare: 10, country: 'SE' },
        { rank: 4, company: 'Living Spaces Inc.', marketShare: 8, country: 'CA' },
        { rank: 5, company: 'Designer Interiors', marketShare: 7, country: 'FR' },
      ]
    }
  };

  const currentData = marketData[selectedCategory as keyof typeof marketData];
  
  const handleCategoryChange = (value: string) => {
    setIsLoading(true);
    setSelectedCategory(value);
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const handleMarketChange = (value: string) => {
    setIsLoading(true);
    setSelectedMarket(value);
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const filteredGrowthData = selectedMarket === 'all' 
    ? currentData.growth 
    : currentData.growth.filter(item => item.market === selectedMarket);

  return (
    <>
      <PageHeader
        title="Market Analysis"
        description="Analyze global market trends and opportunities"
        actions={[
          {
            label: "Export Data",
            icon: <FaDownload />,
            onClick: () => console.log("Export data"),
            variant: "outline"
          }
        ]}
      />

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>Target Market</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="European Union">European Union</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>Time Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue="6m">
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last 1 year</SelectItem>
                <SelectItem value="5y">Last 5 years</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Market Growth by Region</CardTitle>
            <CardDescription>Annual growth rate (%) for {selectedCategory} in global markets</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={filteredGrowthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="market" />
                  <YAxis label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="growth" name="Annual Growth (%)" fill="#1a73e8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>Key metrics for {selectedCategory}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="text-sm text-neutral-500 mb-1">Global Market Size</div>
                  <div className="text-2xl font-bold text-neutral-900">$842.5B</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Badge variant="outline" className="bg-secondary-light text-secondary border-0">+8.3%</Badge>
                    <span className="ml-2 text-neutral-500">vs. previous year</span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="text-sm text-neutral-500 mb-1">Top Importing Market</div>
                  <div className="text-xl font-bold text-neutral-900">United States</div>
                  <div className="text-xs text-neutral-500 mt-1">28.4% of global imports</div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="text-sm text-neutral-500 mb-1">Fastest Growing Market</div>
                  <div className="text-xl font-bold text-neutral-900">China</div>
                  <div className="flex items-center mt-1 text-xs">
                    <Badge variant="outline" className="bg-secondary-light text-secondary border-0">+15.2%</Badge>
                    <span className="ml-2 text-neutral-500">annual growth</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detailed Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="trends" className="flex-1">Import/Export Trends</TabsTrigger>
              <TabsTrigger value="competitors" className="flex-1">Top Competitors</TabsTrigger>
              <TabsTrigger value="regulations" className="flex-1">Regulations & Barriers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Import/Export Trends ({selectedCategory})</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <FaFilter className="mr-2" />
                        Filter
                      </Button>
                      <div className="w-40">
                        <Input placeholder="Search markets..." />
                      </div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={currentData.trends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Value (millions $)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="imports" name="Imports" fill="#1a73e8" />
                      <Bar dataKey="exports" name="Exports" fill="#34a853" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="competitors">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Top Competitors ({selectedCategory})</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <FaFilter className="mr-2" />
                        Filter
                      </Button>
                      <div className="w-40">
                        <Input placeholder="Search companies..." />
                      </div>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-right">Market Share</TableHead>
                        <TableHead className="text-right">Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.competitors.map((competitor) => (
                        <TableRow key={competitor.rank}>
                          <TableCell className="font-medium">{competitor.rank}</TableCell>
                          <TableCell>{competitor.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {competitor.country}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{competitor.marketShare}%</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-secondary-light text-secondary border-0">
                              +{Math.floor(Math.random() * 10) + 2}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="regulations">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Regulatory Environment ({selectedCategory})</h3>
                    <div className="w-60">
                      <Select defaultValue="US">
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="EU">European Union</SelectItem>
                          <SelectItem value="JP">Japan</SelectItem>
                          <SelectItem value="CN">China</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Import Regulations</h4>
                      <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm">
                        <li>Products must meet safety standards under 16 CFR 1500</li>
                        <li>FCC certification required for electronic devices</li>
                        <li>Country of origin labeling required on all imports</li>
                        <li>FDA registration required for certain categories</li>
                      </ul>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Trade Barriers</h4>
                      <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm">
                        <li>5% tariff on imported electronics from certain regions</li>
                        <li>Import quotas apply to specific product categories</li>
                        <li>Technical barriers to trade may apply (certification requirements)</li>
                        <li>Anti-dumping duties on selected products</li>
                      </ul>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Trade Agreements & Benefits</h4>
                      <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm">
                        <li>USMCA provides duty-free access for qualifying goods</li>
                        <li>Generalized System of Preferences (GSP) benefits for developing countries</li>
                        <li>Bilateral agreements with South Korea, Australia, and Singapore</li>
                        <li>Special Economic Zones offering reduced duties</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Global Market Opportunities</CardTitle>
          <CardDescription>Emerging markets and growth opportunities for {selectedCategory}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-80 w-full">
            <img 
              src="https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080" 
              alt="Global market visualization" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Emerging Market Spotlight: Southeast Asia</h3>
                <p className="text-sm mb-4">The Southeast Asian market for {selectedCategory} is projected to grow at 14.2% annually through 2025, with particularly strong opportunities in Vietnam and Thailand.</p>
                <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
                  <FaGlobe className="mr-2" />
                  View Market Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MarketAnalysis;
