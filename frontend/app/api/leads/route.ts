// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAgentLeads } from '@/lib/mongodb/mongodb';
import { ScoredLead, scoreLead } from '@/lib/calc/leadScoring';


export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query params
    const agentId = searchParams.get('agentId') || '82ae0d4d-c3d7-4997-bc7b-12b2261d167e';
    const limit = parseInt(searchParams.get('limit') || '100');
    const tag = searchParams.get('tag') as 'hot' | 'warm' | 'cold' | null;
    const status = searchParams.get('status') as 'new' | 'contacted' | 'qualified' | 'closed' | 'dead' | null;

    console.log('📊 Fetching leads for agent:', agentId);

    // Fetch leads from MongoDB
    const leads = await getAgentLeads(agentId, limit);

    // Score each lead
    const scoredLeads: ScoredLead[] = leads.map(lead => {
      const { score, tag: leadTag } = scoreLead(lead);
      return {
        ...lead,
        score,
        tag: leadTag,
        scoredAt: new Date(),
      };
    });

    // Apply filters
    let filteredLeads = scoredLeads;

    if (tag) {
      filteredLeads = filteredLeads.filter(lead => lead.tag === tag);
    }

    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    // Sort by score (highest first)
    const sortedLeads = filteredLeads.sort((a, b) => b.score - a.score);

    // Calculate stats
    const stats = {
      total: scoredLeads.length,
      hot: scoredLeads.filter(l => l.tag === 'hot').length,
      warm: scoredLeads.filter(l => l.tag === 'warm').length,
      cold: scoredLeads.filter(l => l.tag === 'cold').length,
      totalValue: scoredLeads.reduce((sum, lead) => 
        sum + (lead.analysis?.estimatedValue?.low || 0), 0
      ),
    };

    console.log('✅ Returning', sortedLeads.length, 'leads');

    return NextResponse.json({
      success: true,
      leads: sortedLeads,
      stats,
      count: sortedLeads.length,
    });

  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}