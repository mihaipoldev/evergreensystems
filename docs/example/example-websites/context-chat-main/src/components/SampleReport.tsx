import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, BarChart3, Users, DollarSign } from 'lucide-react';

export const SampleReport = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-xs">
            Intelligence Report
          </Badge>
          <Badge variant="outline" className="text-xs">
            Updated 2 days ago
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          3D Printing Service Providers
        </h1>
        <p className="text-muted-foreground">
          Comprehensive market analysis and opportunity assessment for the 3D printing services vertical
        </p>
      </div>

      {/* Fit Score Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Fit Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-foreground">68</div>
            <div className="flex-1">
              <Progress value={68} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                Moderate fit — opportunity exists but requires careful positioning
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Market Size</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">$4.2B</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>21% CAGR</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Prospects</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">2,847</div>
            <div className="text-sm text-muted-foreground mt-1">
              In target geography
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg. Contract Value</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">$48K</div>
            <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
              <TrendingDown className="h-4 w-4" />
              <span>-5% YoY</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Findings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Key Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Strong Growth Trajectory</p>
              <p className="text-sm text-muted-foreground">
                Market expanding at 21% CAGR with increasing demand for rapid prototyping
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Fragmented Competition</p>
              <p className="text-sm text-muted-foreground">
                Top 5 players hold only 38% market share, leaving room for specialists
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Technology Disruption Risk</p>
              <p className="text-sm text-muted-foreground">
                Rapid technology changes require continuous investment in new capabilities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="mb-6 border-red-200/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Red Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span className="text-sm text-foreground">
                High customer concentration — many providers rely on 2-3 major accounts for 60%+ of revenue
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span className="text-sm text-foreground">
                Pricing pressure from overseas competitors reducing margins by 15-20%
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span className="text-sm text-foreground">
                Equipment obsolescence cycle shortening, increasing CapEx requirements
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Market Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Prototyping Services', share: 45, trend: 'up' },
              { name: 'Production Manufacturing', share: 35, trend: 'up' },
              { name: 'Tooling & Fixtures', share: 20, trend: 'stable' },
            ].map((segment) => (
              <div key={segment.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{segment.name}</span>
                  <span className="text-sm text-muted-foreground">{segment.share}%</span>
                </div>
                <Progress value={segment.share} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacer for bottom */}
      <div className="h-20" />
    </div>
  );
};
