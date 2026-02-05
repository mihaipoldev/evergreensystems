export const icpData = {
  meta: {
    knowledge_base: "icp_intelligence",
    mode: "customer_research",
    generated_at: "2026-01-30",
    input: {
      niche_name: "Custom CRM Developers",
      geo: "US",
      notes: "",
      ai_model: "anthropic/claude-sonnet-4.5"
    },
    focus: "Understanding who this niche sells to - their ideal customers",
    data_quality: {
      overall_confidence: 0.75,
      confidence_methodology: "Weighted average of section confidences. Section confidence based on: source quantity (40%), source recency (30%), source authority (30%). Scores 0.7+ indicate strong research backing.",
      validation_status: "agent_generated",
      sources_total: 47,
      sources_used: [
        "https://programmers.ai/services/hire-crm-software-developers/",
        "https://www.matechco.com/blog/top-crm-development-companies/",
        "https://staxogroup.com/insights/custom-crm-system-developers-tailored-solutions-for-your-business/",
        "https://orases.com/custom-crm-software/",
        "https://www.cognism.com/blog/ideal-customer-profile",
        "https://hginsights.com/2025/03/05/how-to-create-an-ideal-customer-profile-icp/"
      ],
      last_updated: "2026-01-30",
      next_refresh_recommended: "2026-04-30",
      known_limitations: [
        "Market sizing based on LinkedIn/Apollo estimates, not census data",
        "Trigger timing windows are industry heuristics, not measured data",
        "Budget ranges from case studies and industry reports, may vary by region"
      ]
    }
  },
  data: {
    buyer_icp: {
      snapshot: {
        confidence: 0.72,
        description: "High-level summary of who this niche's ideal customers are and why they buy.",
        summary: "The ideal customers for custom CRM developers are mid-market to enterprise B2B companies (50-500 employees, $10M-$100M revenue) experiencing rapid growth or complex operational needs that off-the-shelf CRM platforms like Salesforce or HubSpot cannot adequately address. These companies are typically in industries with unique workflows, compliance requirements, or integration needs—including healthcare (HIPAA compliance, patient management), financial services (regulatory compliance, client data security), real estate (property management, lead tracking), manufacturing (supply chain integration), professional services (client relationship complexity), and B2B SaaS (custom sales pipelines, product-led growth tracking).\n\nThese buyers purchase custom CRM solutions when they hit critical inflection points: outgrowing their current system with poor user adoption (30-50% vs. 85-95% for custom), experiencing process misalignment where generic sales stages don't match their methodology, facing integration challenges with ERP/marketing automation tools, or needing specialized features for compliance, automation, or unique data models. Common triggers include post-funding scaling phases, regulatory mandate changes, CRM migration windows (contract renewals), and measurable operational inefficiencies (manual workflows consuming 40-60% of time that could be automated).\n\nThe best-fit customers have technical maturity to articulate requirements and manage custom software, budget authority for $50K-$250K investments, and organizational urgency driven by growth constraints or competitive pressures. Poor-fit prospects include early-stage startups without product-market fit, companies with simple sales processes suited to off-the-shelf tools, organizations lacking internal technical resources for ongoing maintenance, and highly price-sensitive buyers unwilling to invest in long-term custom solutions.",
        ideal_customer_in_one_sentence: "A scaling B2B company (100-500 employees, $20M-$100M revenue) in a regulated or process-intensive industry that has outgrown its current CRM due to poor adoption, integration gaps, or workflow misalignment, with $75K-$200K budget and organizational urgency to invest in a tailored solution.",
        primary_profile: {
          company_size: "100-500 employees (sweet spot 150-300)",
          revenue_range: "$10M-$100M annually (sweet spot $20M-$75M)",
          budget_for_solution: "$50K-$250K (varies by segment; mid-tier businesses typically invest $75K-$150K for complete solutions including discovery, development, integrations, and initial support)",
          growth_stage: "Scaling - outgrown startup tools but not yet enterprise-sized with dedicated IT development teams; typically Series A/B funded or established profitable companies experiencing 20-50% annual growth",
          technical_maturity: "Moderate to high - have internal technical champions or IT managers who can articulate requirements, manage vendor relationships, and oversee implementation; currently using mid-market CRM (HubSpot, Pipedrive, Zoho) or struggling with underutilized Salesforce; understand API integrations and data architecture basics"
        },
        firmographic_alignment_notes: {
          explanation: "Employee count and revenue don't always correlate perfectly in the custom CRM buyer profile. High-revenue-per-employee companies (e.g., $500K+ per employee in SaaS, fintech, or professional services) may have smaller teams but complex needs and strong budgets. Low-revenue-per-employee companies (e.g., $100K-$200K per employee in manufacturing, healthcare, or staffing) may have larger workforces but tighter budgets and simpler workflow needs.",
          implications: [
            "High revenue/employee ratio ($300K+): Typically knowledge workers, SaaS, or professional services with complex client relationships, sophisticated integration needs, higher deal values ($100K-$250K), and strong budget authority - prioritize these",
            "Moderate revenue/employee ratio ($150K-$300K): Balanced profile in industries like real estate, mid-market B2B, or specialized manufacturing - solid targets with right pain points",
            "Low revenue/employee ratio (<$150K): Service-heavy industries like staffing, retail, or basic manufacturing - may lack budget despite size; qualify carefully for urgency and budget authority",
            "Sweet spot: 150-300 employees with $30M-$75M revenue ($200K-$250K per employee) indicates scaling companies with resources to invest and complexity requiring custom solutions"
          ],
          recommendation: "Prioritize revenue as the primary qualifier (minimum $10M, ideal $20M+) since it better indicates budget capacity, then validate employee count to ensure operational complexity (minimum 50, ideal 100+). Companies below 50 employees rarely have enough process complexity to justify custom development unless in highly specialized niches with strong unit economics. Use revenue-per-employee as a tie-breaker and deal prioritization metric."
        },
        why_they_buy: [
          "Off-the-shelf CRM systems don't align with their unique sales processes, pipelines, or workflow stages - generic templates create workarounds that reduce efficiency and user adoption",
          "Poor user adoption of current CRM (30-50% vs. 85-95% for custom solutions) leads to data quality issues, missed opportunities, and inability to forecast accurately",
          "Complex integration requirements with ERP, legacy systems, proprietary tools, or industry-specific software that standard CRMs can't accommodate without expensive middleware or constant manual data transfers",
          "Regulatory compliance needs (HIPAA for healthcare, SOC 2 for SaaS, financial services regulations) require custom data handling, audit trails, and security features not available in standard platforms",
          "Scaling challenges where current system creates operational bottlenecks - manual tasks consuming 40-60% of team time, slow reporting, inability to handle growing customer volume or complexity",
          "Competitive differentiation through customer experience - custom CRM enables proprietary workflows, client portals, or service delivery methods that create market advantages"
        ],
        why_they_dont_buy: [
          "High upfront costs ($50K-$250K+) and long implementation timelines (3-9 months) with delayed ROI create financial barriers, especially for bootstrapped companies or those with uncertain growth trajectories",
          "Fear of vendor lock-in and ongoing maintenance burden - custom systems require dedicated resources for updates, troubleshooting, and enhancements that off-the-shelf platforms handle automatically",
          "Organizational change management challenges - stakeholder misalignment, resistance from end users, lack of executive sponsorship, or inability to dedicate resources to proper implementation and training",
          "Over-customization concerns based on past failures - companies that previously built overly complex systems that became unmaintainable, broke with updates, or created technical debt",
          "Perception that their processes should conform to industry best practices rather than building around current workflows - belief that CRM adoption failure is a training issue, not a system fit issue",
          "Lack of internal technical capacity to manage vendor relationships, define requirements, or maintain custom software long-term - particularly common in non-technical industries without IT leadership"
        ]
      },
      segments: {
        confidence: 0.7,
        description: "Distinct customer segments this niche serves, ranked by fit and priority.",
        assignment_logic: {
          method: "highest_priority_match_with_signal_validation",
          rules: [
            "Evaluate company against all primary segment criteria simultaneously, starting with required signals",
            "A company qualifies for a segment only if it meets the minimum_to_qualify threshold (typically required signal + 2+ supporting signals)",
            "If company matches multiple segments, assign to highest priority segment based on urgency and deal economics",
            "Validate segment fit by confirming timing window - companies outside best_window move to secondary consideration",
            "Companies meeting only 1 supporting signal with no required signals default to secondary segments or avoid categories"
          ],
          tie_breaker: "If multiple primary segments match equally, prioritize: 1) Compliance-Driven Enterprises (regulatory deadlines create non-negotiable urgency and executive budget authority with strongest close rates), 2) Post-Funding Scale-Ups (fresh capital provides immediate budget availability and growth pressure creates urgency, though longer sales cycles), 3) CRM Migration Window companies (contract renewal timing creates natural buying window with defined budget, moderate urgency), 4) Integration-Complex Operations (clear operational pain and strong ROI but longer education cycles and more stakeholders). Use revenue-per-employee ratio as final tie-breaker, prioritizing higher ratios that indicate budget capacity."
        },
        primary: [
          {
            name: "Post-Funding Scale-Ups",
            priority: 1,
            description: "Recently funded (Series A/B/C within past 12-18 months) high-growth companies experiencing rapid scaling pain. Their existing CRM infrastructure can't keep pace with expansion - they're adding 10+ new employees monthly, entering new markets, or launching new product lines. Fresh capital provides budget availability and growth mandate creates organizational urgency to solve operational bottlenecks before they become strategic constraints.",
            how_to_identify: {
              required_signals: [
                "Recent funding announcement ($5M+ Series A or $15M+ Series B/C within past 18 months) found via Crunchbase, PitchBook, or press releases",
                "Rapid headcount growth (20%+ quarterly growth visible through LinkedIn employee count tracking or job posting volume)"
              ],
              supporting_signals: [
                "Multiple job postings for revenue-generating roles (sales, customer success, account management) indicating scaling go-to-market teams",
                "Geographic expansion announcements or new office openings",
                "Product launch announcements or new market entries creating additional CRM complexity",
                "Executive hiring (VP Sales, CRO, VP Operations) bringing process change expectations",
                "Tech stack signals: using mid-market CRM (HubSpot, Pipedrive) visible through job descriptions, BuiltWith, or case studies"
              ],
              minimum_to_qualify: "Must have both required signals (recent funding + rapid growth) plus at least 2 supporting signals indicating operational scaling challenges"
            },
            typical_profile: {
              industries: ["B2B SaaS and software companies", "Fintech and financial technology", "Healthcare technology and digital health", "E-commerce and digital retail platforms", "Professional services with technology focus"],
              employee_count: "50-300 employees (rapid growth trajectory toward 500+)",
              revenue_range: "$5M-$50M ARR with 50-100%+ YoY growth",
              funding_stage: "Series A ($5M-$15M) to Series C ($30M-$100M)",
              geographic_concentration: "Tech hubs: San Francisco, NYC, Boston, Austin, Seattle, Denver"
            },
            deal_economics: {
              typical_deal_size: "$75K-$200K (willing to invest 1-3% of funding round in operational infrastructure)",
              sales_cycle: "90-150 days (faster than average - funding creates urgency and reduces budget approval cycles; typically involves VP Sales/CRO, Head of Operations, and 1-2 stakeholders)",
              close_rate_vs_average: "Higher (35-45% vs. 25% average) - fresh capital, clear growth pain, executive mandate to scale infrastructure, and shorter decision cycles drive higher conversion"
            },
            why_they_buy: "Growth mandate from investors requires operational scalability. Current CRM creates visible bottlenecks in reporting (can't track metrics investors demand), pipeline management (sales team spending hours on manual entry instead of selling), or customer onboarding (new customers falling through cracks). Executive leadership recently hired from larger companies brings expectations for sophisticated CRM capabilities their current stack can't deliver.",
            timing: {
              best_window: "3-6 months post-funding when initial hiring surge creates CRM strain but before budget gets fully allocated to headcount; quarterly board meetings often surface operational gaps",
              still_viable: "6-12 months post-funding during operational infrastructure investment phase, though budget pressure increases as runway considerations emerge",
              urgency_fades: "12-18 months post-funding when focus shifts to next fundraising metrics and new projects compete for budget; unless severe pain point emerges, decision defers to next funding round"
            },
            best_angles: ["support_rapid_growth", "investor_ready_reporting", "scale_infrastructure", "eliminate_bottlenecks"]
          },
          {
            name: "Compliance-Driven Enterprises",
            priority: 2,
            description: "Established companies in highly regulated industries facing new compliance mandates, audit findings, or regulatory risks that their current CRM cannot address. These organizations need custom solutions to embed regulatory requirements (HIPAA, SOC 2, GDPR, financial services regulations) directly into CRM workflows, data handling, and audit trails. Regulatory deadlines create non-negotiable urgency and executive-level budget authority.",
            how_to_identify: {
              required_signals: [
                "Operates in regulated industry (healthcare, financial services, insurance, legal, government contracting) visible through industry classification codes, company description, or website content"
              ],
              supporting_signals: [
                "Recent compliance announcements, audit mentions, or regulatory filings indicating scrutiny",
                "Job postings for Compliance Officers, Data Privacy roles, or Security positions mentioning CRM/data management",
                "Industry news about regulatory changes affecting their sector (new HIPAA rules, SOC 2 requirements, state privacy laws)",
                "Visible certifications (SOC 2, ISO 27001, HITRUST) or compliance badges on website indicating maturity",
                "Partnership announcements with healthcare systems, financial institutions, or government entities requiring compliance",
                "Tech stack signals: using general business CRM without industry-specific compliance features"
              ],
              minimum_to_qualify: "Required industry signal + at least 3 supporting signals indicating active compliance focus and gaps in current systems"
            },
            typical_profile: {
              industries: ["Healthcare providers and medical practices", "Health technology and digital health platforms", "Financial services and wealth management", "Insurance providers and brokerages", "Legal services and law firms"],
              employee_count: "100-1,000 employees (enough complexity to require sophisticated compliance)",
              revenue_range: "$15M-$250M (compliance costs justify at this scale)",
              regulatory_exposure: "High - direct patient data (PHI), financial data, or legal client information requiring statutory protection"
            },
            deal_economics: {
              typical_deal_size: "$100K-$250K (compliance features, audit trails, security requirements, and specialized integrations increase project scope)",
              sales_cycle: "120-180 days (legal review, security assessments, compliance validation, and multiple stakeholder approvals extend timeline; typically involves Legal, Compliance, IT Security, Operations, and C-suite)",
              close_rate_vs_average: "Higher (40-50% vs. 25% average) - regulatory mandates create non-discretionary urgency; compliance deadlines override typical budget objections; executive sponsorship from GC or Chief Compliance Officer drives decisions"
            },
            why_they_buy: "Regulatory mandate changes or audit findings reveal that current CRM cannot meet compliance requirements. Off-the-shelf solutions require expensive workarounds, create audit trail gaps, or lack required data handling capabilities (encryption, access controls, retention policies). Risk of fines, license revocation, or legal liability creates executive-level urgency that overrides typical budget constraints. Custom solution provides audit-ready documentation and embedded compliance workflows.",
            timing: {
              best_window: "Immediately following audit findings, regulatory deadline announcements (6-12 months before compliance effective date), or partnership requirements from major clients/partners demanding certifications",
              still_viable: "During annual compliance review cycles (Q4/Q1 for many organizations), budget planning periods when compliance investments get prioritized, or after competitive wins requiring capability expansion",
              urgency_fades: "After compliance deadline passes or temporary workarounds implemented; if immediate crisis avoided, project may defer to next fiscal year unless ongoing pain point remains"
            },
            best_angles: ["regulatory_compliance", "risk_mitigation", "audit_readiness", "data_security"]
          },
          {
            name: "CRM Migration Window Companies",
            priority: 3,
            description: "Companies actively dissatisfied with their current CRM approaching contract renewal windows or experiencing severe adoption/functionality problems. These organizations have measurable pain from poor user adoption (sub-40%), frustrated sales teams bypassing the system, or inability to get accurate reporting. Contract renewal timing creates natural buying window with defined budget already allocated to CRM investment.",
            how_to_identify: {
              required_signals: [
                "Current CRM contract renewal window (3-6 months before renewal) identifiable through contract timing, fiscal year cycles, or renewal discussions mentioned in earnings calls/team meetings"
              ],
              supporting_signals: [
                "Public complaints about current CRM on review sites (G2, Capterra) from employees at target company",
                "Job postings mentioning CRM migration, CRM implementation, or Salesforce/HubSpot administrator roles indicating system challenges",
                "Executive changes (new VP Sales, CRO, or COO) within past 6 months often triggering system reevaluation",
                "Visible workarounds: active use of spreadsheets, separate tools, or manual processes evident from job descriptions or LinkedIn posts from employees",
                "Company growth (50%+ headcount increase) since CRM implementation suggesting system no longer fits scale"
              ],
              minimum_to_qualify: "Contract renewal timing signal + at least 2 supporting signals indicating dissatisfaction or system misfit"
            },
            typical_profile: {
              industries: ["B2B software and SaaS (complex sales cycles)", "Professional services (consulting, agencies, law firms)", "Real estate (property management, brokerage operations)", "Manufacturing with B2B sales", "Wholesale and distribution"],
              employee_count: "100-500 employees",
              revenue_range: "$20M-$150M",
              current_crm_profile: "Typically using HubSpot (outgrown free/starter tiers), Salesforce (underutilized due to complexity), or Zoho/Pipedrive (hitting functionality limits)"
            },
            deal_economics: {
              typical_deal_size: "$60K-$150K (migration costs, data cleanup, and training included in scope)",
              sales_cycle: "90-120 days (renewal deadline creates urgency; budget already allocated to CRM spending reduces approval complexity; typically involves Sales Leadership, IT/Operations, and Finance for budget reallocation)",
              close_rate_vs_average: "Average to higher (30-40% vs. 25%) - clear pain point and budget availability offset by competitive pressure from existing vendor discounts and fear of migration disruption"
            },
            why_they_buy: "Current CRM has become a source of frustration rather than productivity. Sales team actively resists using it, leading to incomplete data, inaccurate forecasting, and management blind spots. User adoption below 40% means expensive software investment provides minimal ROI. Contract renewal creates forcing function to either fix the problem or accept another year of poor performance. New leadership or changed business model makes existing system obsolete.",
            timing: {
              best_window: "4-6 months before contract renewal when pain is acute but enough time exists for proper evaluation and migration before renewal deadline",
              still_viable: "3 months before renewal (tight timeline creates urgency) or immediately post-renewal if secured short-term contract (annual vs. multi-year) to enable faster switching",
              urgency_fades: "After renewal signed (especially multi-year contracts) unless pain point becomes severe enough to justify breaking contract; window reopens 12 months before next renewal"
            },
            best_angles: ["eliminate_frustration", "improve_adoption", "accurate_forecasting", "unified_customer_view"]
          },
          {
            name: "Integration-Complex Operations",
            priority: 4,
            description: "Companies with complex technology ecosystems requiring deep integrations between CRM and multiple other systems (ERP, marketing automation, customer support, billing, proprietary tools). Standard CRM integrations via Zapier or native connectors create data sync issues, manual workarounds, or functionality gaps. These organizations have sophisticated operations where CRM must serve as central hub connecting 5+ critical systems.",
            how_to_identify: {
              required_signals: [
                "Complex tech stack visible through job postings, BuiltWith data, or case studies mentioning 5+ business systems (ERP, billing platform, marketing automation, support desk, analytics, proprietary tools)"
              ],
              supporting_signals: [
                "Job postings for Integration Specialists, Solutions Architects, or RevOps roles focused on system connectivity",
                "Use of enterprise ERP systems (NetSuite, SAP, Microsoft Dynamics, Epicor) requiring sophisticated CRM integration",
                "Custom-built internal tools or proprietary systems mentioned in engineering blog posts or job descriptions",
                "Multi-channel sales approach (direct, partner, e-commerce) requiring unified customer view across channels",
                "Service delivery complexity (professional services, field operations, multi-location) needing workflow coordination",
                "Complaints about data silos, manual data entry, or system disconnects in employee reviews or social posts"
              ],
              minimum_to_qualify: "Required tech stack complexity signal + at least 3 supporting signals indicating integration pain and budget/sophistication for custom solution"
            },
            typical_profile: {
              industries: ["Manufacturing with configure-price-quote (CPQ) needs", "Wholesale and distribution", "Professional services with project management integration", "Field services and equipment maintenance", "Multi-location retail or hospitality"],
              employee_count: "150-750 employees",
              revenue_range: "$30M-$200M",
              technical_sophistication: "High - typically have internal IT team or technical operations leaders; understand APIs, data architecture, and system integration concepts"
            },
            deal_economics: {
              typical_deal_size: "$80K-$200K (extensive integration work, custom API development, and data mapping drive higher costs)",
              sales_cycle: "150-210 days (longer technical evaluation, proof-of-concept requirements, and multiple stakeholder alignment across IT, Operations, Sales, and Finance teams)",
              close_rate_vs_average: "Average to lower (20-30% vs. 25%) - clear ROI but complexity creates analysis paralysis; technical stakeholders may prefer building in-house; requires strong executive sponsorship to overcome organizational inertia"
            },
            why_they_buy: "Data fragmentation across multiple systems creates operational inefficiency - sales team entering same customer data in 3+ places, customer service unable to see sales history, billing disconnected from CRM creating revenue recognition issues. Integration middleware (Zapier, Workato) provides brittle connections that break frequently, can't handle complex workflows, or have functionality gaps. Custom CRM with purpose-built integrations eliminates manual data entry, provides single source of truth, and enables sophisticated workflows across entire customer lifecycle.",
            timing: {
              best_window: "After new system implementation (ERP upgrade, marketing automation rollout) exposes integration gaps; during digital transformation initiatives with executive mandate to modernize operations",
              still_viable: "Following operational failures (major customer data error, revenue recognition issues, failed audit) that highlight integration risks; during M&A integration when combining disparate systems",
              urgency_fades: "If manual workarounds become institutionalized or integration pain distributed across many people rather than concentrated; temporary middleware solutions may reduce urgency despite not solving underlying problem"
            },
            best_angles: ["eliminate_data_silos", "operational_efficiency", "single_source_of_truth", "workflow_automation"]
          },
          {
            name: "Industry-Specific Workflow Companies",
            priority: 5,
            description: "Organizations in niche industries with highly specialized workflows, terminology, or processes that generic CRMs cannot accommodate without extensive customization. Industries like real estate (property listings, showing management), construction (project bidding, subcontractor management), recruiting (candidate pipelines, placement tracking), or hospitality (event management, guest services) require domain-specific functionality that justifies custom development.",
            how_to_identify: {
              required_signals: [
                "Operates in industry with specialized workflows not well-served by standard CRMs: real estate, construction, recruiting/staffing, hospitality, non-profit fundraising, education/enrollment management"
              ],
              supporting_signals: [
                "Currently using industry-specific CRM (Realtor.com CRM, Bullhorn for recruiting) but outgrowing it or experiencing limitations",
                "Job postings describing unique workflow requirements or industry-specific processes not standard in typical sales CRM",
                "Company size/revenue suggesting they've outgrown entry-level industry solutions but aren't enterprise-scale for full custom ERP",
                "Multiple locations or franchises requiring standardized but customized workflows",
                "Integration needs with industry-specific platforms (MLS for real estate, ATS for recruiting, PMS for hospitality)",
                "Custom terminology or sales stages specific to industry visible in job descriptions or company materials"
              ],
              minimum_to_qualify: "Required industry signal + at least 2 supporting signals indicating they've reached scale/complexity where industry-specific custom CRM provides ROI"
            },
            typical_profile: {
              industries: ["Real estate (brokerages, property management)", "Construction and general contracting", "Recruiting and staffing agencies", "Hospitality and event management", "Non-profit organizations (fundraising, donor management)", "Educational institutions (enrollment, alumni relations)"],
              employee_count: "75-400 employees",
              revenue_range: "$10M-$75M",
              workflow_complexity: "High industry-specific needs but relatively standard within industry; looking for competitive advantage through superior process management"
            },
            deal_economics: {
              typical_deal_size: "$50K-$120K (smaller scale than enterprise but requires significant industry-specific customization and domain expertise)",
              sales_cycle: "120-180 days (education required about custom benefits vs. industry solutions; typically budget-conscious and need strong ROI justification; involves industry operations leaders, not just sales)",
              close_rate_vs_average: "Lower (15-25% vs. 25%) - competition from established industry-specific solutions, price sensitivity, and need to prove ROI over familiar tools; works best with strong industry case studies and domain expertise"
            },
            why_they_buy: "Industry-specific CRM platforms provide basic functionality but lack flexibility for their unique processes, create workarounds that reduce efficiency, or can't integrate with other critical industry tools. Generic CRM platforms require so much customization that implementation costs approach custom development anyway. Custom solution provides competitive differentiation by optimizing industry workflows better than competitors using standard tools, enabling superior client service or operational efficiency.",
            timing: {
              best_window: "When scaling to multiple locations/franchises requiring standardization; after hitting limits of industry CRM (user caps, feature restrictions, integration gaps); during strategic initiatives to improve competitive positioning",
              still_viable: "Following leadership changes bringing fresh perspective on technology; when expanding service offerings beyond what industry CRM supports; during industry consolidation requiring system unification",
              urgency_fades: "If industry CRM vendor releases needed features; if manual workarounds become accepted practice; during economic downturns when budget scrutiny increases and ROI harder to justify"
            },
            best_angles: ["industry_specific_optimization", "competitive_advantage", "process_excellence", "client_experience_differentiation"]
          }
        ],
        secondary: [
          {
            name: "Profitable Bootstrap Companies",
            description: "Self-funded, profitable companies ($10M-$50M revenue, 100-300 employees) that have grown organically without VC funding. While they have budget capacity from profitability, they lack the growth urgency and executive mandate that funded companies have. Decision cycles are longer, ROI scrutiny is higher, and they often prefer incremental improvements over major system overhauls.",
            why_secondary: "Longer sales cycles (180-240 days), higher price sensitivity despite budget capacity, conservative decision-making culture, and lower urgency unless acute pain point. Often prefer to exhaust optimization of existing systems before investing in custom development. Strong relationship or referral required to overcome conservative purchasing approach.",
            when_to_pursue: "When they have new leadership from growth company background, are preparing for acquisition/exit and need to professionalize operations, face competitive pressure requiring operational improvement, or have specific pain point with clear ROI (e.g., regulatory requirement, major customer demand). Best approached through warm referrals from existing clients in similar industries."
          },
          {
            name: "Private Equity Portfolio Companies",
            description: "Companies recently acquired by private equity firms undergoing operational improvement initiatives. PE firms often mandate technology upgrades, process standardization across portfolio companies, or integration of acquired entities - creating CRM opportunities. However, timing is critical and decision authority complex.",
            why_secondary: "Decision-making involves PE operating partners and portfolio company leadership creating additional complexity. Budget may be allocated to other operational priorities (ERP, headcount, geographic expansion). Timing windows are narrow - too early (first 6 months post-acquisition) and priorities unclear; too late (12+ months) and major systems decisions already made. Requires understanding PE firm's value creation playbook and relationships at both levels.",
            when_to_pursue: "6-12 months post-acquisition during operational improvement phase; when PE firm has track record of technology investment across portfolio; if acquisition thesis involves scaling operations or rolling up fragmented market (requiring standardized systems); when operational pain points identified during due diligence remain unaddressed. Ideal with relationship to PE operating partner or portfolio company executive champion."
          },
          {
            name: "Enterprise Divisions with Autonomy",
            description: "Business units or divisions within larger enterprises ($1B+ parent company) that have operational and budget autonomy to make technology decisions. These divisions (typically $25M-$150M revenue, 150-500 employees) face enterprise constraints but have division-specific needs that corporate IT/standard corporate CRM cannot address.",
            why_secondary: "Complex procurement processes, corporate IT involvement requirements, longer approval chains (6-12 months), and potential conflicts with enterprise architecture standards. Corporate may mandate enterprise CRM platforms even if division needs differ. Budget authority often shared between division leadership and corporate IT/procurement creating coordination challenges.",
            when_to_pursue: "When division has strong P&L autonomy and executive sponsor (GM/Division President) willing to champion against corporate IT; division operates in different industry/business model than parent company justifying different systems; corporate undergoing enterprise CRM implementation that will take 12-24 months allowing division interim solution; division recently acquired and not yet integrated into corporate systems. Requires senior-level relationships and patience with procurement complexity."
          }
        ],
        avoid: [
          {
            name: "Early-Stage Startups Pre-PMF",
            why_avoid: "Startups under 30 employees or pre-Series A ($10M revenue) lack budget ($50K+ is substantial percentage of runway), have undefined/rapidly changing processes making custom CRM premature, face high failure risk making long-term relationship unlikely, and should be using simple off-the-shelf tools until product-market fit achieved and processes stabilized. Custom CRM investment diverts resources from product development and customer acquisition where focus should be.",
            exception: "Well-funded pre-revenue companies (Series A+ raised) in industries requiring sophisticated CRM from day one (e.g., enterprise sales to regulated industries requiring compliance features, complex multi-stakeholder B2B with long sales cycles). Even then, approach with caution and validate strong technical leadership, clear use case, and budget commitment from investors/board."
          },
          {
            name: "Cost-Optimizing Enterprises",
            why_avoid: "Large enterprises (500+ employees) undergoing cost reduction initiatives, hiring freezes, or budget cuts treat custom CRM as discretionary spending. These organizations face procurement challenges (6-12 month approval processes), require extensive compliance/security reviews adding cost and timeline, have corporate IT mandates for enterprise platforms (Salesforce, Microsoft), and focus on reducing vendor count rather than adding custom solutions. Sales cycles exceed 12 months with high no-decision rates.",
            exception: "If you have existing relationship delivering other services and custom CRM solves specific pain point with executive sponsor; division has autonomous budget and urgent need that corporate CRM cannot address; M&A integration requires custom solution to unify disparate systems; or regulatory mandate creates non-discretionary project. Even then, ensure executive-level sponsorship (C-suite or direct report) and allocated budget before investing resources."
          },
          {
            name: "Simple Transactional B2C",
            why_avoid: "Companies with straightforward transactional sales (e-commerce with simple products, consumer services, B2C subscriptions without complex onboarding) have needs well-served by Shopify, HubSpot, or other off-the-shelf platforms. Custom CRM investment cannot be justified when standard tools cost $50-500/month vs. $50K-150K custom build. Their sales processes lack complexity requiring customization - short sales cycles, few stakeholders, standard workflows, minimal integration needs beyond e-commerce/payment platforms.",
            exception: "High-volume B2C with sophisticated customer segmentation/personalization needs (e.g., multi-tier loyalty programs, complex subscription logic, heavy integration with proprietary systems) or hybrid B2C/B2B model where B2B component has enterprise complexity. Even then, typically better served by customized implementation of platform CRM rather than fully custom build unless very specific proprietary algorithms or competitive advantage from customer data management."
          },
          {
            name: "Highly Decentralized Organizations",
            why_avoid: "Organizations with franchise models, highly autonomous regional offices, or decentralized decision-making where each location operates independently lack central budget authority, cannot agree on requirements across locations, and won't achieve adoption of standardized system. Custom CRM requires organizational alignment, central budget commitment ($50K-250K), and change management across all entities - rarely feasible in decentralized structures. Each location prefers own tools creating political challenges.",
            exception: "Corporate/franchisor mandating standardization across network with budget to fund implementation and authority to require adoption; company undergoing consolidation/centralization initiative with executive mandate; or franchise/location owners collaboratively funding solution with strong central leadership. Requires validation that decision authority truly centralized and adoption mechanisms exist (contractual requirements, withheld fees until compliance, etc.)."
          }
        ]
      },
      buying_committee: {
        confidence: 0.78,
        description: "Who makes the buying decision, who influences it, and what each stakeholder cares about.",
        decision_structure: {
          typical_committee_size: "5-8 people for mid-market deals, up to 10+ for enterprise custom CRM projects involving multiple departments",
          decision_timeline: "3-6 months for mid-market ($50K-$150K), 6-12 months for enterprise deals ($150K+). Custom CRM projects typically take 4-9 months from initial contact to contract signing due to technical complexity and multiple stakeholder approvals",
          approval_thresholds: {
            under_50k: "Director-level approval with VP awareness. Typically involves 3-4 stakeholders (Operations Director, Revenue Ops Manager, Technical Lead). Decision timeline: 2-3 months",
            "50k_to_150k": "VP-level approval with C-suite awareness. Involves 5-6 stakeholders including CFO for budget sign-off, CTO/IT Director for technical validation. Decision timeline: 3-6 months",
            over_150k: "C-suite approval required (CEO, CFO, CTO). Full committee of 6-10 stakeholders including Legal, Procurement, Security, and department heads. Board awareness or approval may be needed. Decision timeline: 6-12 months"
          },
          how_decisions_get_made: "Custom CRM decisions typically start with a champion (Revenue Ops or Sales Ops leader) who identifies pain points with current systems. The champion builds an internal business case, then engages IT/CTO for technical feasibility assessment. Finance/CFO reviews ROI projections and budget fit. A formal RFP process involves 3-5 vendor evaluations with technical demos, reference checks, and pilot projects. Legal and Procurement negotiate contracts. Final approval flows from functional leaders (VP Sales, VP Ops) to C-suite, with emphasis on technical architecture validation, integration capabilities, and long-term TCO analysis."
        },
        roles: [
          {
            role_name: "Champion / Revenue Operations Leader",
            titles: ["VP Revenue Operations", "Director of Revenue Operations", "VP Sales Operations", "Director of Sales Operations", "Head of Sales Enablement", "Chief Revenue Officer (CRO)", "VP of Business Operations", "Director of Sales Strategy", "Senior Manager Revenue Operations", "Manager of Sales Systems"],
            seniority: "Director to VP level, occasionally C-suite in smaller organizations",
            what_they_care_about: [
              "Will this solve our sales team's workflow pain points and reduce manual data entry?",
              "Can we get accurate forecasting and pipeline visibility across all stages?",
              "How quickly can we see ROI in terms of rep productivity and deal velocity?",
              "Will this integrate seamlessly with our existing tech stack (Salesforce, HubSpot, marketing automation)?",
              "Can we customize reports and dashboards for our unique sales process?",
              "What's the adoption curve and training burden on our sales team?"
            ],
            what_keeps_them_up: [
              "Sales reps abandoning the new CRM due to poor UX or training gaps",
              "Project delays that disrupt quota attainment during implementation",
              "Data migration failures causing lost opportunity history",
              "Overpromising to executive team and underdelivering on adoption metrics",
              "Vendor lock-in with inflexible customization that can't scale with business changes"
            ],
            how_to_win_them: "Position as a partnership focused on their strategic goals, not just technology. Show deep understanding of their current sales process pain points through discovery. Provide detailed implementation timeline with minimal business disruption, concrete adoption playbooks, and measurable success metrics (rep time savings, forecast accuracy improvement). Offer pilot programs or phased rollouts to prove value before full commitment. Share case studies from similar company sizes and industries showing 30-90 day quick wins.",
            red_flags_from_them: [
              "Pushing for unrealistic timelines or unwilling to discuss phased approach",
              "Focusing only on features rather than business outcomes and workflows",
              "Can't articulate clear data migration strategy or integration plan",
              "Resistance to providing references from similar implementations",
              "Unclear on post-launch support and ongoing customization capabilities"
            ],
            influence: "High to Very High. Typically the internal champion who drives evaluation, builds business case, and advocates throughout the process."
          },
          {
            role_name: "Economic Buyer / CFO",
            titles: ["Chief Financial Officer (CFO)", "VP of Finance", "Director of Finance", "VP of Financial Planning & Analysis", "Controller", "Head of FP&A", "VP of Corporate Development", "Finance Director", "Senior Finance Manager", "Director of Business Operations"],
            seniority: "VP to C-suite level",
            what_they_care_about: [
              "What's the total cost of ownership over 3-5 years including maintenance, upgrades, and hidden costs?",
              "How does ROI compare to off-the-shelf alternatives or continuing with current system?",
              "What are payment terms, milestone structures, and budget predictability?",
              "What financial risk do we assume if the project fails or runs over budget?",
              "How will this impact our EBITDA and when does payback period occur?",
              "Can we see detailed cost breakdown and justification for custom vs. off-the-shelf?"
            ],
            what_keeps_them_up: [
              "Scope creep leading to 50-100% budget overruns common in custom development",
              "Low adoption rates meaning the investment delivers no actual business value",
              "Being the one who approved a failed technology project that hurts company financials",
              "Ongoing maintenance and licensing costs that weren't properly disclosed upfront",
              "Opportunity cost of capital allocation to this vs. other strategic initiatives"
            ],
            how_to_win_them: "Lead with rigorous financial analysis: detailed TCO model, NPV calculations, IRR projections, and payback period. Show conservative ROI estimates with clear assumptions and sensitivity analysis. Provide transparent pricing with detailed milestone-based payment structure. Address their skepticism head-on by acknowledging risks and your mitigation strategies. Demonstrate how custom CRM creates defensible competitive advantage beyond just cost savings.",
            red_flags_from_them: [
              "Vague or inflated ROI projections without supporting data",
              "Inability to clearly articulate why custom is financially superior to alternatives",
              "Lack of transparency on ongoing costs, maintenance fees, or upgrade expenses",
              "No clear governance structure for budget management and change orders",
              "Pushy sales tactics or pressure to commit before thorough financial analysis"
            ],
            influence: "Very High. Ultimate budget authority and veto power. Can kill deals even when other stakeholders are enthusiastic if financial case isn't compelling."
          },
          {
            role_name: "Technical Buyer / CTO",
            titles: ["Chief Technology Officer (CTO)", "VP of Engineering", "VP of Information Technology", "Director of IT", "Director of Engineering", "Head of Technology", "VP of Technical Operations", "Chief Information Officer (CIO)", "IT Director", "Enterprise Architect"],
            seniority: "Director to C-suite level",
            what_they_care_about: [
              "Does your technical architecture align with our tech stack and future roadmap?",
              "What's your development methodology (Agile, DevOps) and how do you handle changes?",
              "How do you ensure security, compliance (GDPR, SOC2, HIPAA), and data privacy?",
              "What's your code quality standards, testing protocols, and technical debt approach?",
              "Can your team integrate with our existing systems (ERP, data warehouse, APIs)?",
              "What happens post-launch: support, maintenance, scalability, and documentation?"
            ],
            what_keeps_them_up: [
              "Vendor lacks depth in required technologies leading to poor implementation",
              "Security vulnerabilities or compliance gaps that expose the company to risk",
              "Integration failures causing data silos or system breakdowns",
              "Technical debt from poor code quality requiring expensive refactoring",
              "Vendor dependency where we can't maintain or modify the system ourselves"
            ],
            how_to_win_them: "Demonstrate deep technical expertise through architecture discussions, code samples, and technical case studies. Provide proof of certifications (ISO, SOC2), security protocols, and compliance experience in their industry. Offer technical pilot or proof-of-concept with clear success metrics. Show your development process, tools, and communication cadence. Provide access to your lead architect for whiteboard sessions.",
            red_flags_from_them: [
              "Can't articulate technical architecture or provide architectural diagrams",
              "Vague on security practices, certifications, or compliance experience",
              "No clear integration strategy or API documentation",
              "Unwilling to share code quality metrics or testing methodologies",
              "Lack of relevant technical experience in similar projects or industry"
            ],
            influence: "Very High. Has effective veto power based on technical feasibility assessment. Can delay or derail deals if they identify significant technical risks."
          },
          {
            role_name: "End Users / Sales Leadership",
            titles: ["VP of Sales", "Chief Revenue Officer (CRO)", "SVP of Sales", "Director of Sales", "Head of Sales", "Regional Sales Director", "VP of Business Development", "Sales Manager", "Enterprise Sales Director", "Director of Customer Success"],
            seniority: "Manager to VP/C-suite level",
            what_they_care_about: [
              "Will this make my reps' lives easier or create more administrative burden?",
              "Can we maintain or accelerate our current sales velocity during transition?",
              "Does this improve our ability to close deals and manage pipeline effectively?",
              "How intuitive is the interface for non-technical sales professionals?",
              "Will this give us better visibility into team performance and coaching opportunities?",
              "What's the realistic timeline for training and full adoption across the team?"
            ],
            what_keeps_them_up: [
              "Sales productivity dropping during implementation, missing quarterly targets",
              "Team rebellion against new system if it's clunky or adds work",
              "Losing historical customer relationship data in migration",
              "Management pushing a system that field sales finds unusable in practice",
              "Being held accountable for adoption metrics when system has usability issues"
            ],
            how_to_win_them: "Involve them early in requirements gathering and show how design addresses their specific workflow pain points. Provide hands-on demos with their actual use cases, not generic scenarios. Show mobile capabilities since reps work remotely. Emphasize ease of use, minimal clicks, and automation of manual tasks. Create champions program where influential reps become early adopters and advocates.",
            red_flags_from_them: [
              "System requires too many clicks or manual data entry compared to current process",
              "Complex interface that will require extensive training and slow adoption",
              "Lack of mobile optimization for reps working in the field",
              "No clear plan for managing transition without disrupting sales activities",
              "Dismissive attitude toward sales team input or workflow requirements"
            ],
            influence: "Medium to High. While not typically budget holders, their buy-in is critical for adoption success."
          },
          {
            role_name: "Procurement / Legal",
            titles: ["VP of Procurement", "Director of Procurement", "Chief Procurement Officer", "Procurement Manager", "General Counsel", "VP of Legal", "Director of Legal", "Corporate Counsel", "Contract Manager", "Director of Vendor Management"],
            seniority: "Manager to VP level, C-suite for legal in larger orgs",
            what_they_care_about: [
              "What are the contract terms, SLAs, and liability limitations?",
              "How do we handle IP ownership, especially for custom code?",
              "What are termination clauses, data portability, and exit rights?",
              "Are there hidden fees, change order processes, or cost escalation clauses?",
              "How do payment milestones align with deliverables and acceptance criteria?",
              "What indemnification and insurance requirements do you carry?"
            ],
            what_keeps_them_up: [
              "Vendor lock-in with unfavorable contract terms we can't escape",
              "IP disputes over who owns the custom code and modifications",
              "Undefined scope leading to endless change orders and cost disputes",
              "Inadequate SLAs or remedies if vendor fails to deliver or meet deadlines",
              "Data security breaches or compliance violations exposing company to liability"
            ],
            how_to_win_them: "Provide clear, fair contract templates that address standard enterprise concerns. Be transparent about IP ownership models (typically customer owns custom code). Offer flexible termination and data portability provisions. Provide detailed scope of work with change order process. Show adequate insurance coverage and indemnification terms.",
            red_flags_from_them: [
              "Inflexible or one-sided contract terms that won't pass legal review",
              "Vague IP ownership or licensing provisions",
              "Unreasonable liability limitations or lack of adequate insurance",
              "Complex change order process that enables vendor to inflate costs",
              "Unwillingness to negotiate or accommodate standard enterprise contract requirements"
            ],
            influence: "Medium. Can significantly delay deals through contract negotiation. Rarely have veto power on business merits, but can block on legal/contractual grounds."
          },
          {
            role_name: "IT Operations / Implementation Team",
            titles: ["Director of IT Operations", "IT Manager", "Systems Administrator", "Solutions Architect", "Integration Specialist", "Director of Business Systems", "Senior Systems Engineer", "IT Project Manager", "Technical Program Manager", "Director of Enterprise Applications"],
            seniority: "Individual contributor to Director level",
            what_they_care_about: [
              "How much of our team's time will this consume during and after implementation?",
              "What's the quality of documentation and knowledge transfer process?",
              "How will this integrate with our existing monitoring and support tools?",
              "What ongoing maintenance and support responsibilities fall on our team?",
              "Is your team responsive and collaborative when technical issues arise?",
              "Will we be able to make minor changes ourselves or are we vendor-dependent?"
            ],
            what_keeps_them_up: [
              "Project becoming a resource black hole pulling team away from other priorities",
              "Poor documentation leaving us unable to support the system internally",
              "Vendor becomes unresponsive post-launch when we need urgent support",
              "System instability or performance issues creating constant firefighting",
              "Lack of admin tools forcing us to rely on vendor for minor changes"
            ],
            how_to_win_them: "Show respect for their time and workload. Provide clear RACI matrix showing vendor vs. client responsibilities. Offer comprehensive documentation, training, and knowledge transfer. Demonstrate responsive support with clear SLAs and escalation paths. Show admin interfaces that empower them to make configuration changes.",
            red_flags_from_them: [
              "Unrealistic expectations about client team availability or involvement",
              "Vague about what ongoing support and maintenance looks like",
              "Poor documentation or no knowledge transfer plan",
              "History of implementation teams being difficult to work with",
              "System design requires constant vendor involvement for minor changes"
            ],
            influence: "Low to Medium. Not decision-makers but important influencers. Their feedback to CTO/IT Director carries weight."
          },
          {
            role_name: "Marketing Leadership (for CRM with Marketing Automation)",
            titles: ["VP of Marketing", "Chief Marketing Officer (CMO)", "Director of Marketing Operations", "VP of Demand Generation", "Director of Marketing Technology", "Head of Growth Marketing", "VP of Digital Marketing", "Director of Customer Marketing", "Marketing Operations Manager", "Director of Marketing Analytics"],
            seniority: "Manager to C-suite level",
            what_they_care_about: [
              "How does this improve lead quality, attribution, and campaign effectiveness?",
              "Can we track the full customer journey from awareness to closed-won?",
              "Does this integrate with our marketing automation platform (Marketo, HubSpot, Pardot)?",
              "Can we segment audiences and personalize campaigns based on CRM data?",
              "What reporting capabilities exist for marketing ROI and pipeline contribution?",
              "How will this improve sales and marketing alignment?"
            ],
            what_keeps_them_up: [
              "Data silos preventing visibility into which campaigns drive revenue",
              "Poor integration causing lead routing failures and follow-up gaps",
              "Sales team not using marketing-generated leads or providing feedback",
              "Can't prove marketing ROI to justify budget allocations",
              "Complex attribution models that are theoretical but not practically implementable"
            ],
            how_to_win_them: "Show how custom CRM can solve marketing-specific challenges that off-the-shelf solutions don't address. Demonstrate seamless integration with marketing automation tools. Provide examples of custom attribution modeling and campaign tracking. Show how unified data improves lead scoring and segmentation.",
            red_flags_from_them: [
              "CRM is sales-focused without adequate marketing functionality or integration",
              "Can't support sophisticated attribution or multi-touch campaign tracking",
              "Poor data quality or syncing causing lead management problems",
              "No clear plan for marketing automation integration",
              "Treats marketing as afterthought rather than equal stakeholder"
            ],
            influence: "Low to Medium. Influence increases if CRM includes significant marketing automation or if company has strong marketing-led revenue model."
          }
        ],
        committee_dynamics: {
          typical_buying_process: [
            "Pain recognition: Champion identifies limitations of current CRM (data silos, manual processes, lack of customization)",
            "Internal alignment: Champion builds business case and identifies key stakeholders across Sales, IT, Finance, Operations",
            "Requirements gathering: Cross-functional team documents must-have features, integrations, and success criteria",
            "Vendor research: Shortlist 3-5 custom CRM developers through referrals, industry research, RFPs",
            "Initial demos: High-level capability demonstrations with vendors (weeks 4-8)",
            "Technical evaluation: Deep-dive demos, architecture reviews, reference checks, security assessments (weeks 8-16)",
            "Pilot or POC: Selected vendor(s) build proof-of-concept or pilot for 1-2 use cases (weeks 16-20)",
            "Business case finalization: Champion works with Finance to build detailed ROI model and present to C-suite",
            "Negotiation: Procurement and Legal negotiate contract terms, SLAs, payment structure (weeks 20-26)",
            "Executive approval: Final presentation to C-suite for budget approval and strategic alignment",
            "Contract signing and project kickoff: SOW finalized, teams mobilized, implementation planning begins"
          ],
          where_deals_stall: [
            "Post-demo to technical evaluation: Committee struggles to align on requirements or prioritize features, leading to analysis paralysis",
            "Technical validation: CTO/IT raises concerns about integration complexity, security, or vendor capabilities",
            "ROI justification: CFO pushes back on cost vs. alternatives, questions adoption assumptions or payback period",
            "Budget approval timing: Deal sits waiting for next fiscal year budget cycle or quarterly budget review",
            "Internal resource constraints: IT team too busy to commit to implementation timeline, causing indefinite delays",
            "Procurement/Legal negotiation: Contract terms create friction, especially around IP ownership, SLAs, or payment terms",
            "Champion departure or reorganization: Internal sponsor leaves company or changes roles, losing momentum",
            "Competitive displacement: Another vendor or alternative solution (off-the-shelf with customization) enters late-stage consideration"
          ],
          how_to_unstall: [
            "Multi-threading: Build relationships with multiple stakeholders beyond champion to create redundancy",
            "Executive sponsorship: Elevate conversation to C-suite level to create top-down pressure and priority",
            "Phased approach: Propose smaller Phase 1 to reduce risk and investment, prove value before full commitment",
            "Address specific objections: Directly tackle technical concerns with architect sessions, security audits, or extended pilots",
            "Create urgency: Tie to business drivers (fiscal year-end, upcoming product launch, competitor threat, system sunset)",
            "Simplify decision: Reduce complexity by narrowing scope, providing clear comparison frameworks, or offering flexible terms",
            "Resource support: Offer more vendor-led implementation to reduce burden on client IT resources",
            "Success stories: Bring in references or case studies from similar companies that address specific stakeholder concerns"
          ]
        }
      },
      triggers: {
        confidence: 0.75,
        description: "Events and circumstances that cause these customers to actively seek solutions.",
        high_urgency: [
          {
            trigger: "Recent Funding Round (Series A, B, C, or IPO)",
            description: "Company announces significant funding ($10M+) requiring rapid scaling of sales operations, customer management, and revenue infrastructure",
            why_it_works: "Funding creates immediate budget availability and pressure to demonstrate growth. Companies need CRM infrastructure to scale sales team from 5-10 reps to 30-50+ reps quickly. Investors expect operational rigor and data-driven decision making. Post-funding companies are 2.5x more likely to invest in technology infrastructure within 6 months. Urgency is driven by board expectations and need to deploy capital efficiently.",
            timing: {
              peak_urgency: "0-3 months post-announcement: Budget allocated, growth hiring underway, need systems before new reps start",
              still_good: "3-6 months post-announcement: Implementation planning phase, building business cases",
              urgency_fading: "6-9 months post-announcement: May have already selected alternative or built internal workarounds",
              likely_too_late: "9+ months post-announcement: Likely already implemented solution or deprioritized investment"
            },
            detection_sources: [
              "Crunchbase funding announcements",
              "Company press releases and news",
              "LinkedIn company updates",
              "PitchBook database",
              "TechCrunch and industry media coverage",
              "Investor relations pages for public companies"
            ]
          },
          {
            trigger: "Rapid Headcount Growth in Sales/Revenue Teams",
            description: "Company posting 5+ sales, account executive, or revenue operations roles simultaneously, or growing sales team by 30%+ in a quarter",
            why_it_works: "Aggressive sales hiring signals intention to scale revenue rapidly. New reps need CRM training and standardized processes immediately. Growing teams expose limitations of current systems (spreadsheets, basic CRMs). Companies realize they need proper infrastructure before onboarding wave of expensive sales talent. Revenue leadership is highly engaged and motivated to equip team properly.",
            timing: {
              peak_urgency: "During active hiring wave: Need system in place before new hires start to avoid bad habits",
              still_good: "2-4 months after hiring surge begins: New reps struggling with current tools, leadership recognizes need",
              urgency_fading: "4-6 months after hiring: Team has adapted to suboptimal tools, harder to disrupt status quo",
              likely_too_late: "6+ months after hiring: Sales team entrenched in current process, change management more difficult"
            },
            detection_sources: [
              "LinkedIn job postings",
              "Company careers pages",
              "Indeed, ZipRecruiter, Greenhouse job boards",
              "LinkedIn headcount tracking tools (e.g., LinkedIn Sales Navigator, UserGems)",
              "Employee growth data (LinkedIn, BuiltWith)",
              "Glassdoor reviews mentioning growth"
            ]
          },
          {
            trigger: "CRM System Migration or Replacement Initiative",
            description: "Company publicly expressing frustration with current CRM, posting jobs for CRM migration roles, or signaling platform evaluation through content engagement",
            why_it_works: "Active dissatisfaction with existing system creates immediate openness to alternatives. Decision already made to change, question is which solution. High pain level drives urgency. Companies expressing migration intent have already overcome internal resistance to change. Budget often already allocated. 68% of companies report disruption from vendor M&A, creating replacement cycles.",
            timing: {
              peak_urgency: "During active evaluation: RFP process underway, vendors being compared",
              still_good: "3-6 months into evaluation: Still gathering requirements, not yet committed",
              urgency_fading: "6-9 months into evaluation: Likely narrowed to final 2-3 vendors, harder to enter",
              likely_too_late: "9+ months or contract signed: Too late unless implementation fails"
            },
            detection_sources: [
              "Job postings for 'CRM Migration Manager,' 'Salesforce Administrator,' 'CRM Implementation Lead'",
              "G2, Capterra negative reviews from target accounts",
              "LinkedIn posts/comments from employees complaining about CRM",
              "Reddit, industry forums discussing CRM pain points",
              "Intent data showing searches for 'CRM alternatives,' 'custom CRM development'",
              "Technographic changes (BuiltWith, Datanyze showing tag removals)"
            ]
          },
          {
            trigger: "Merger, Acquisition, or Significant Corporate Restructuring",
            description: "Company announced M&A activity or major restructuring requiring CRM consolidation across multiple entities or business units",
            why_it_works: "M&A creates mandatory IT integration work with hard deadlines. Multiple legacy systems need consolidation. Leadership changes bring fresh perspective and willingness to invest in new solutions. Budget often available as part of integration costs. Need unified view of combined customer base. SaaS M&A increased 40% in 2020-2022 with $200B+ in deals, creating ripple effect of CRM consolidation needs.",
            timing: {
              peak_urgency: "3-9 months post-announcement: Integration planning active, systems being evaluated",
              still_good: "9-15 months post-announcement: Implementation phase, receptive to solutions that ease integration",
              urgency_fading: "15-24 months post-announcement: Core integration likely complete or committed",
              likely_too_late: "24+ months post-announcement: Systems integrated, moved on to other priorities"
            },
            detection_sources: [
              "Press releases and SEC filings",
              "Company announcements on LinkedIn",
              "Wall Street Journal, Bloomberg, industry trade publications",
              "Crunchbase acquisition tracking",
              "PitchBook M&A database",
              "Job postings for integration roles"
            ]
          },
          {
            trigger: "New Revenue Operations or Sales Operations Executive Hire",
            description: "Company hires new VP/Director of Revenue Operations, Sales Operations, or CRO who is likely conducting tech stack assessment",
            why_it_works: "New executives are hired to drive change and show quick wins. First 90 days typically involve operational assessment including technology evaluation. They bring fresh perspective without attachment to current systems. Often have mandate and budget to modernize infrastructure. Want to establish credibility with high-impact initiative. New CROs/RevOps leaders specifically tasked with creating scalable, data-driven processes.",
            timing: {
              peak_urgency: "30-90 days after hire: Conducting assessment, building change roadmap",
              still_good: "90-180 days after hire: Presenting recommendations, securing budget",
              urgency_fading: "180-365 days after hire: May have already selected solution or deprioritized",
              likely_too_late: "365+ days after hire: Established their tech stack strategy"
            },
            detection_sources: [
              "LinkedIn job changes and announcements",
              "Company press releases about executive hires",
              "LinkedIn Sales Navigator lead alerts",
              "Industry publications covering leadership moves",
              "UserGems or similar platforms tracking job changes",
              "Direct LinkedIn monitoring of target accounts"
            ]
          }
        ],
        medium_urgency: [
          {
            trigger: "Product Launch or Market Expansion",
            description: "Company launching new product line, entering new geographic market, or announcing significant go-to-market expansion requiring enhanced customer management",
            why_it_works: "New products/markets require updated sales processes, territory management, and customer segmentation that existing CRM may not support. Leadership recognizes need for better infrastructure before scaling new initiatives. Budget often allocated as part of launch investment. Creates natural inflection point to upgrade systems. Urgency moderate because implementation can be phased alongside launch timeline.",
            timing: {
              peak_urgency: "3-6 months before launch: Planning phase, building supporting infrastructure",
              still_good: "0-3 months before launch: Implementation rush to be ready for launch",
              urgency_fading: "0-6 months after launch: Using existing systems, may defer upgrade",
              likely_too_late: "6+ months after launch: Adapted to current systems for new initiative"
            },
            detection_sources: [
              "Company press releases and announcements",
              "Product marketing content and landing pages",
              "LinkedIn company updates",
              "Job postings for market-specific roles",
              "Industry conference presentations",
              "Investor relations updates"
            ]
          },
          {
            trigger: "Compliance or Regulatory Requirements",
            description: "Company facing new compliance requirements (GDPR, CCPA, HIPAA, SOC2, industry-specific regulations) requiring enhanced data management and audit capabilities",
            why_it_works: "Regulatory compliance is non-negotiable with potential legal and financial penalties. Creates hard deadline based on regulatory timeline. Executives prioritize to avoid risk exposure. Often requires custom data handling, consent management, or audit trails that off-the-shelf CRMs don't adequately support. Budget typically available because it's viewed as risk mitigation not discretionary spending.",
            timing: {
              peak_urgency: "6-12 months before compliance deadline: Active solution seeking and implementation",
              still_good: "3-6 months before deadline: Urgent implementation, may accept higher costs for faster delivery",
              urgency_fading: "0-3 months before deadline: May opt for minimal viable compliance vs. comprehensive solution",
              likely_too_late: "After deadline passed: Either compliant with alternative solution or facing penalties"
            },
            detection_sources: [
              "Industry regulatory news and updates",
              "Company blog posts about compliance initiatives",
              "Job postings for compliance roles",
              "LinkedIn content from executives discussing regulatory challenges",
              "Industry conference topics and sessions",
              "Legal/compliance publications"
            ]
          },
          {
            trigger: "Customer Retention or Churn Issues",
            description: "Company experiencing elevated churn rates, customer complaints about service quality, or public acknowledgment of retention challenges",
            why_it_works: "Churn directly impacts revenue and investor confidence, creating pressure for solutions. Leadership acknowledges existing customer management approaches aren't working. Need better visibility into customer health, touchpoints, and success metrics. Custom CRM can provide specific workflows and analytics that generic solutions miss. However, urgency moderate because companies often try multiple approaches (CSM hiring, process changes) before considering major CRM investment.",
            timing: {
              peak_urgency: "3-6 months after problem acknowledged: Tried immediate fixes, now seeking systematic solution",
              still_good: "6-12 months after problem identified: Building comprehensive retention strategy",
              urgency_fading: "12-18 months after initial problem: Either stabilized or pursuing alternative approaches",
              likely_too_late: "18+ months: Churn addressed through other means or accepted as cost of business"
            },
            detection_sources: [
              "Earnings calls mentioning churn or retention challenges",
              "Glassdoor reviews from employees discussing customer issues",
              "Job postings for Customer Success or Retention roles",
              "LinkedIn posts from leadership about customer focus",
              "Industry analyst reports and news coverage",
              "G2/Capterra review trends showing service issues"
            ]
          },
          {
            trigger: "Technology Stack Consolidation Initiative",
            description: "Company announces initiative to reduce number of vendors, consolidate tech stack, or address 'tool sprawl' across sales and marketing organizations",
            why_it_works: "Tech stack consolidation creates opportunity to replace multiple point solutions with integrated custom CRM. CFO pressure to reduce software spend makes decision-makers receptive. IT burden of managing many integrations drives search for unified solutions. Provides opportunity to position custom CRM as replacement for 3-5 existing tools with better integration. Timing more flexible than high-urgency triggers but creates sustained interest.",
            timing: {
              peak_urgency: "0-6 months into consolidation initiative: Active evaluation and vendor rationalization",
              still_good: "6-12 months into initiative: Implementing consolidation, receptive to solutions",
              urgency_fading: "12-18 months into initiative: Major consolidation decisions made",
              likely_too_late: "18+ months: Consolidation complete, unlikely to add new vendor"
            },
            detection_sources: [
              "CFO or CTO blog posts about tech efficiency",
              "Job postings for MarTech or IT optimization roles",
              "LinkedIn content about reducing vendor count",
              "Earnings calls discussing cost optimization",
              "Industry publications covering company's operational efficiency initiatives",
              "Technographic data showing tool removals"
            ]
          }
        ],
        low_urgency: [
          {
            trigger: "Conference Attendance or Industry Event Participation",
            description: "Key stakeholders attending industry conferences, SaaS events, or revenue operations summits where CRM topics are featured",
            why_it_works: "Conference attendance indicates active learning mode and openness to new approaches. Exposure to peer case studies and best practices creates aspirational motivation. Networking with peers experiencing similar challenges validates pain points. Post-event momentum can drive exploration conversations. However, urgency low because attendance indicates research phase, not active buying mode. Long nurture typically required.",
            timing: {
              peak_urgency: "0-2 weeks post-event: High engagement, open to follow-up conversations",
              still_good: "2-8 weeks post-event: Still processing learnings, open to education",
              urgency_fading: "8-16 weeks post-event: Back to daily priorities, education mode fading",
              likely_too_late: "16+ weeks post-event: Moved on unless specific project initiated"
            },
            detection_sources: [
              "Conference attendee lists",
              "LinkedIn posts about event attendance",
              "Conference mobile apps showing attendees",
              "Event check-ins on social media",
              "Speaker lists and session participants",
              "Event sponsor lead generation"
            ]
          },
          {
            trigger: "Consumption of Educational Content",
            description: "Company stakeholders downloading whitepapers, watching webinars, or engaging with content about CRM best practices, custom development, or sales operations optimization",
            why_it_works: "Content engagement indicates awareness of problems and interest in solutions. Shows stakeholder in learning/research mode. Repeated engagement over time indicates sustained interest not just casual browsing. Enables nurture sequence to build relationship. However, urgency very low because many content consumers are in early exploration with no immediate project or budget. Long-term relationship building required.",
            timing: {
              peak_urgency: "Sustained engagement over 30-90 days: Indicates active research project",
              still_good: "Continued engagement over 90-180 days: Long-term interest, possible future project",
              urgency_fading: "Sporadic engagement over 180+ days: General interest but no specific initiative",
              likely_too_late: "No engagement for 90+ days: Interest waned, deprioritized research"
            },
            detection_sources: [
              "Marketing automation platform data (HubSpot, Marketo, Pardot)",
              "Website visitor tracking and form submissions",
              "Webinar registration and attendance",
              "Email engagement tracking",
              "LinkedIn content engagement analytics",
              "Intent data platforms (Bombora, 6sense, DemandBase)"
            ]
          },
          {
            trigger: "Incremental Business Growth Milestones",
            description: "Company reaching revenue milestones ($10M ARR, $50M ARR), customer count thresholds, or employee headcount markers that suggest scaling needs",
            why_it_works: "Growth milestones often trigger operational assessments and infrastructure investments. Leadership recognizes that processes working at previous scale aren't sustainable. Board or investors may be pushing for operational maturity appropriate to size. However, urgency low because companies often defer tech investments until pain is acute. Milestone itself doesn't create immediate need, just indicates increased sophistication potential.",
            timing: {
              peak_urgency: "6-12 months after milestone: Pain from scale starting to manifest",
              still_good: "12-24 months after milestone: Actively building scaled operations",
              urgency_fading: "24-36 months after milestone: Either addressed scaling needs or plateaued",
              likely_too_late: "36+ months after milestone: Operating model established for current scale"
            },
            detection_sources: [
              "Crunchbase company data",
              "LinkedIn employee count tracking",
              "Press releases announcing milestones",
              "Earnings reports for public companies",
              "Industry rankings and awards (Inc 5000, Deloitte Fast 500)",
              "Third-party data providers (PitchBook, CB Insights)"
            ]
          }
        ],
        cooling_signals: {
          description: "These signals indicate reduced urgency or receptiveness, suggesting deals should be paused or deprioritized rather than fully disqualified. Continue nurturing but reduce sales intensity.",
          signals: [
            {
              signal: "Budget Freeze or Hiring Freeze Announcement",
              meaning: "Company entering cost conservation mode due to market conditions, missed targets, or cash flow concerns. Discretionary spending paused but not necessarily eliminated long-term",
              action: "Shift to education and relationship building. Position custom CRM as efficiency investment that reduces costs or drives revenue. Offer flexible payment terms or phased approach. Stay engaged but don't push for near-term commitment",
              revisit_when: "Hiring resumes, positive earnings announcement, or fiscal year reset (typically 3-9 months)"
            },
            {
              signal: "Champion or Executive Sponsor Departure",
              meaning: "Internal advocate who was driving the evaluation process leaves company or changes roles. Momentum and institutional knowledge lost. New stakeholder needs relationship building and education",
              action: "Quickly identify and engage with replacement hire or alternative champion. Re-establish relationship with buying committee. Offer to re-present business case for new stakeholders. Don't assume deal dead but acknowledge reset required",
              revisit_when: "Replacement executive hired (typically 2-6 months), or alternative champion emerges with renewed interest"
            },
            {
              signal: "Delayed Decision Timeline Communications",
              meaning: "Prospect communicating that decision pushed to next quarter or next fiscal year. Could indicate budget issues, competing priorities, or internal uncertainty. Not rejection but definitely cooling",
              action: "Understand root cause of delay through discovery. If legitimate operational reason, respect timeline and maintain relationship. Offer to help with business case or planning. Reduce contact frequency but maintain visibility through valuable content sharing",
              revisit_when: "Specified timeline arrives, or earlier if new trigger event creates urgency"
            },
            {
              signal: "Reduced Engagement from Buying Committee",
              meaning: "Meeting requests declined, emails going unanswered, or reduced participation in evaluation activities. Could indicate deal deprioritized, internal politics, or competitive displacement",
              action: "Direct conversation with main contact to understand situation. Don't chase aggressively as it appears desperate. Provide clear 'break-up' email offering to step back while staying available. Often reveals true situation",
              revisit_when: "Prospect re-engages, or monitoring shows new trigger event (6-12 months typically)"
            },
            {
              signal: "Exploration of Significantly Cheaper Alternatives",
              meaning: "Prospect requesting pricing for minimal scope or exploring low-cost alternatives suggesting budget constraints or reduced commitment to custom approach",
              action: "Explore whether this is negotiation tactic vs. genuine budget limitation. Offer tiered approach with Phase 1 addressing highest-priority needs. Help them understand TCO vs. just upfront cost. Be willing to walk away if fit is poor",
              revisit_when: "Business conditions improve or cheap alternative fails to deliver (9-18 months)"
            },
            {
              signal: "Scope Reduction Below Viable Threshold",
              meaning: "Prospect asking to reduce project scope to point where it no longer solves their core problem or makes business sense for vendor. Often indicates budget pressure or reduced conviction",
              action: "Educate on risks of under-scoping and why minimal approach unlikely to succeed. Recommend pausing until budget adequate for proper solution. Maintain relationship but don't pursue unprofitable or likely-to-fail project",
              revisit_when: "Budget situation improves or business case strengthens (6-12 months)"
            }
          ]
        },
        disqualifying_signals: [
          {
            signal: "Recently Signed Long-Term Contract with Competitor",
            description: "Prospect signed multi-year contract with competing CRM vendor or custom development firm within last 6-12 months",
            why_disqualifying: "Financial and operational commitment to alternative solution. Contract penalties and sunk costs make switching unlikely. Implementation resources committed. Decision fatigue makes stakeholders resistant to reconsidering. 12-36 month minimum before they'll consider alternatives",
            detection: "LinkedIn announcements, press releases, contract management databases, direct conversation, job postings for vendor-specific roles (e.g., 'Salesforce Administrator')"
          },
          {
            signal: "No Clear Pain or Satisfied with Current System",
            description: "Stakeholders express satisfaction with current CRM, can't articulate specific problems, or describe only minor inconveniences rather than business-impacting issues",
            why_disqualifying: "No compelling event to drive change. Status quo bias is strong without acute pain. Budget approval nearly impossible without clear business case. Buying committee won't engage without recognized need. Even if system has limitations, they've adapted workflows around them",
            detection: "Discovery calls revealing lack of pain points, positive G2/Capterra reviews from company, low engagement with content or outreach, 'we're fine for now' responses"
          },
          {
            signal: "Extreme Budget Constraints or Startup Pre-Revenue",
            description: "Company has no realistic budget for custom CRM development ($50K+ minimum typically), very early stage with limited runway, or explicitly states budget is <$25K",
            why_disqualifying: "Custom CRM development requires significant investment that doesn't make sense for severely budget-constrained organizations. Pre-revenue startups should use off-the-shelf solutions. Trying to sell when budget doesn't exist wastes resources and creates poor customer experience. They'll experience buyer's remorse and potentially harm reputation",
            detection: "Funding data showing minimal capital raised, early-stage designation (pre-seed, seed), direct budget conversations, company size under 10 employees, no revenue data"
          },
          {
            signal: "Looking for Off-the-Shelf Solution or Already Decided on Alternative Approach",
            description: "Prospect explicitly states they're looking for off-the-shelf SaaS solution, prefer no-code/low-code platforms, or have already decided on alternative approach (e.g., building in-house)",
            why_disqualifying: "Fundamental misalignment on solution approach. They don't value or see need for custom development. Trying to convince them to change approach is low-probability and resource-intensive. Better to focus on prospects actively seeking custom solutions",
            detection: "RFP specifies off-the-shelf only, direct statements in conversation, evaluation criteria emphasize speed and low cost over customization, engagement with off-the-shelf vendors in parallel"
          },
          {
            signal: "No Executive Sponsorship or Access to Decision Makers",
            description: "Unable to access or engage with C-suite or VP-level stakeholders after multiple attempts. Only interacting with individual contributors or managers without budget authority or influence",
            why_disqualifying: "Custom CRM deals require executive sponsorship for budget approval and organizational change management. Bottom-up selling rarely works for $50K+ custom development projects. Without executive access, deal will stall in evaluation phase indefinitely. Low-level contacts may be exploring options without organizational mandate",
            detection: "Repeated requests for executive meetings declined, champion unable or unwilling to facilitate introductions, company structure shows high bureaucracy, buying committee doesn't include decision-makers"
          },
          {
            signal: "Unrealistic Expectations or Requirements",
            description: "Prospect has expectations that are fundamentally misaligned with reality: enterprise functionality on small budget, 2-week implementation timeline, guaranteed ROI, or feature requirements that are technically impossible",
            why_disqualifying: "Indicates lack of understanding of custom development process and costs. High likelihood of dissatisfaction regardless of delivery quality. Will be difficult client with constant scope disputes. Better to disqualify than create negative experience and reputation risk",
            detection: "Discovery calls revealing misaligned expectations, RFP with contradictory requirements, unwillingness to adjust expectations when educated, comparison to off-the-shelf pricing without understanding customization value"
          }
        ]
      },
      purchase_journey: {
        confidence: 0.75,
        description: "How these customers evaluate and buy solutions.",
        stages: [
          {
            stage: "Problem Recognition",
            typical_duration: "2-4 weeks",
            what_happens: "Company recognizes CRM limitations affecting growth—poor integrations, lack of customization, or inability to scale.",
            customer_activities: [
              "Document workflow bottlenecks and integration failures",
              "Gather feedback from sales and ops teams on pain points",
              "Assess whether off-the-shelf CRM meets future needs"
            ],
            what_they_need: "Validation that custom CRM solves unique business challenges better than off-the-shelf alternatives.",
            your_goal: "Position custom development as strategic investment for competitive advantage and long-term scalability."
          },
          {
            stage: "Solution Exploration",
            typical_duration: "4-8 weeks",
            what_happens: "Evaluate build vs buy options, research custom CRM vendors, and assess technical feasibility.",
            customer_activities: [
              "Compare total cost of ownership for custom vs off-the-shelf",
              "Review vendor portfolios and case studies in their industry",
              "Conduct internal stakeholder alignment sessions",
              "Define must-have features and integration requirements"
            ],
            what_they_need: "Clear understanding of customization capabilities, implementation timelines, and ROI projections.",
            your_goal: "Demonstrate industry expertise through relevant case studies and establish credibility with discovery phase offerings."
          },
          {
            stage: "Vendor Evaluation",
            typical_duration: "3-6 weeks",
            what_happens: "Issue RFPs, conduct vendor demos, score proposals against weighted criteria, and check references.",
            customer_activities: [
              "Evaluate technical stack compatibility and integration approach",
              "Assess vendor's agile methodology and feedback processes",
              "Verify HIPAA/compliance capabilities if applicable",
              "Review support models and post-launch maintenance"
            ],
            what_they_need: "Proof of delivery success through client testimonials and transparent project timelines with milestones.",
            your_goal: "Win through superior discovery process, flexible development approach, and demonstrated vertical expertise."
          },
          {
            stage: "Business Case & Approval",
            typical_duration: "4-8 weeks",
            what_happens: "Build ROI model, secure executive buy-in, negotiate contract terms, and finalize budget allocation.",
            customer_activities: [
              "Present business case to CFO and executive team",
              "Negotiate pricing and payment terms",
              "Define success metrics and KPIs",
              "Align on data migration and change management plans"
            ],
            what_they_need: "ROI calculators, phased implementation options to reduce risk, and clear contractual SLAs.",
            your_goal: "Provide flexible payment structures and detailed implementation roadmaps that reduce perceived risk."
          },
          {
            stage: "Commitment & Implementation",
            typical_duration: "3-6 months",
            what_happens: "Contract signed, discovery phase begins, agile development sprints commence with ongoing stakeholder feedback.",
            customer_activities: [
              "Participate in discovery workshops and requirements refinement",
              "Provide access to existing systems for integration",
              "Review sprint demos and provide iterative feedback",
              "Prepare team for training and change management"
            ],
            what_they_need: "Transparent communication, regular sprint reviews, and proactive issue resolution to maintain confidence.",
            your_goal: "Deliver early wins through phased releases and exceed expectations to generate advocacy and referrals."
          }
        ],
        evaluation_criteria: {
          must_haves: [
            "Industry-specific experience (fintech compliance, healthcare HIPAA, SaaS workflows)",
            "API-first architecture with proven integration capabilities",
            "Agile development methodology with 2-week sprint cycles",
            "Transparent pricing with clear scope and timeline estimates",
            "Post-launch support and maintenance SLAs",
            "Data migration expertise from legacy CRMs"
          ],
          differentiators: [
            "Vertical specialization in target customer's industry",
            "No-code/low-code customization options for future changes",
            "Proprietary features unavailable in off-the-shelf CRMs",
            "Proven ability to reduce long-term TCO vs subscription models",
            "Track record of on-time, on-budget delivery",
            "Comprehensive training and change management support"
          ],
          deal_breakers: [
            "Lack of compliance expertise for regulated industries",
            "Inability to demonstrate similar project success",
            "Rigid waterfall methodology without iterative feedback",
            "Unclear or unpredictable cost structures",
            "Poor post-launch support or vendor instability",
            "Limited scalability for future business growth"
          ]
        },
        objections_and_handling: [
          {
            objection: "Custom development costs too much upfront compared to SaaS subscriptions",
            underlying_concern: "Budget constraints and uncertainty about achieving positive ROI within acceptable timeframe.",
            handling_approach: "Present 3-5 year TCO analysis showing subscription costs plus customization fees exceed custom build costs, emphasize phased implementation to spread investment.",
            proof_to_provide: "ROI calculator comparing total ownership costs, case study showing client achieving payback within 18-24 months."
          },
          {
            objection: "Implementation timeline is too long—we need a solution now",
            underlying_concern: "Urgent business needs and fear that delays will impact revenue or competitive position.",
            handling_approach: "Offer phased MVP approach delivering core functionality in 8-12 weeks, highlight that rushed off-the-shelf implementations often fail due to poor fit.",
            proof_to_provide: "Phased implementation roadmap with early value milestones, statistics on off-the-shelf CRM failure rates (70%+ due to misalignment)."
          },
          {
            objection: "We'll be dependent on your team for ongoing maintenance and updates",
            underlying_concern: "Vendor lock-in risk and concern about long-term support availability or cost escalation.",
            handling_approach: "Emphasize code ownership transfer, comprehensive documentation, and optional managed services with transparent SLAs and competitive pricing.",
            proof_to_provide: "Sample maintenance agreement with clear pricing, client testimonials about support responsiveness and knowledge transfer."
          },
          {
            objection: "Off-the-shelf CRMs are more reliable and battle-tested than custom builds",
            underlying_concern: "Risk of bugs, downtime, or technical failures that disrupt business operations.",
            handling_approach: "Acknowledge concern but emphasize rigorous QA processes, highlight that off-the-shelf rigidity creates operational workarounds that introduce errors.",
            proof_to_provide: "Testing protocols including automated testing and UAT processes, uptime guarantees, case studies with performance metrics."
          },
          {
            objection: "Our team lacks technical resources to manage a custom CRM long-term",
            underlying_concern: "Fear of complexity and inability to make changes without expensive developer intervention.",
            handling_approach: "Design admin-friendly interfaces with no-code configuration for common changes, offer managed services options or hybrid support models.",
            proof_to_provide: "Demo of admin configuration tools, training program overview, tiered support packages with response time guarantees."
          }
        ]
      },
      competitive_context: {
        confidence: 0.78,
        description: "What alternatives these customers consider and how to compete.",
        alternatives: [
          {
            alternative: "Status Quo / Do Nothing",
            platforms: [],
            when_chosen: "When perceived switching costs or change management risk outweigh current pain, or when budget constraints prevent investment.",
            strengths: "Zero upfront cost, no implementation disruption, familiar to existing team.",
            weaknesses: "Continues to constrain growth, perpetuates inefficiencies, risks competitive disadvantage as business scales.",
            how_custom_wins: "Quantify cost of inaction through lost productivity, demonstrate phased approach minimizes disruption while delivering measurable ROI."
          },
          {
            alternative: "Premium Off-the-Shelf CRM Platforms",
            platforms: ["Salesforce Financial Services Cloud", "Microsoft Dynamics 365", "HubSpot Enterprise"],
            when_chosen: "When company prioritizes speed to market, has standard workflows, and values vendor-managed updates and proven reliability.",
            strengths: "Quick deployment (days to weeks), established vendor support, pre-built compliance features, extensive third-party integrations.",
            weaknesses: "High recurring costs ($300+/user/month), limited customization forces workflow compromises, vendor lock-in with price escalation.",
            how_custom_wins: "Target companies with unique workflows requiring extensive customization; show 3-5 year TCO advantage and competitive differentiation through proprietary features."
          },
          {
            alternative: "Mid-Tier Configurable CRM Platforms",
            platforms: ["Zoho CRM", "Pipedrive", "monday CRM"],
            when_chosen: "Budget-conscious mid-market companies needing moderate customization with lower subscription costs ($14-65/user/month).",
            strengths: "Affordable pricing, decent customization through workflows and APIs, easier user adoption than enterprise platforms.",
            weaknesses: "Customization hits limits quickly for complex needs, integration challenges with niche systems, scalability concerns at enterprise level.",
            how_custom_wins: "Position as 'graduation path' for companies outgrowing mid-tier limitations; emphasize unlimited customization and integration flexibility."
          },
          {
            alternative: "Build In-House",
            platforms: [],
            when_chosen: "When company has strong internal development team and CRM is core competitive advantage requiring ongoing rapid iteration.",
            strengths: "Complete control over roadmap, intimate understanding of business needs, no vendor dependencies.",
            weaknesses: "Diverts engineering resources from core product, underestimates maintenance burden, lacks specialized CRM development expertise.",
            how_custom_wins: "Position as 'best of both worlds'—dedicated CRM expertise without distracting internal team, faster time-to-market, proven delivery track record."
          },
          {
            alternative: "Heavily Customize Existing Platform",
            platforms: ["Salesforce with custom development", "Microsoft Power Platform customization"],
            when_chosen: "When committed to specific platform ecosystem but needs exceed native capabilities, willing to invest in platform-specific developers.",
            strengths: "Leverages existing platform investment, combines vendor support with customization, familiar to teams already using ecosystem.",
            weaknesses: "Platform customization costs 40-60 hours per integration, vendor updates break customizations, still pays high subscription fees.",
            how_custom_wins: "Compare total costs including platform fees plus customization; highlight risk-free architecture not vulnerable to vendor roadmap changes."
          }
        ],
        positioning_guidance: {
          when_clearly_wins: [
            "Company has unique workflows that are competitive differentiators requiring proprietary CRM features",
            "Complex integration requirements with legacy or niche systems not supported by standard CRMs",
            "Regulated industries needing custom compliance workflows beyond off-the-shelf capabilities",
            "Rapid growth trajectory requiring unlimited scalability without per-user licensing escalation",
            "Current CRM subscription costs exceeding $100K annually with extensive customization needs",
            "Multi-tenant or white-label requirements for customers or partners"
          ],
          when_probably_wrong: [
            "Company has standard sales processes well-served by existing platforms",
            "Timeline pressure requiring deployment within 4 weeks",
            "Limited budget under $50K total for CRM solution",
            "Lack of internal stakeholder alignment on requirements",
            "Company culture resistant to change with poor software adoption history",
            "No dedicated project champion or executive sponsorship for implementation"
          ]
        }
      },
      ops_outputs: {
        description: "Actionable outputs for direct use in list building and campaign execution",
        targeting_quick_reference: {
          firmographics: {
            employee_count: {
              range: "50-500 employees",
              sweet_spot: "150-300 employees",
              filter_format: "LinkedIn Sales Nav: 51-200, 201-500 | ZoomInfo: 50-300"
            },
            revenue_range: {
              range: "$10M-$100M annually",
              sweet_spot: "$20M-$75M annually",
              note: "Prioritize revenue over headcount - minimum $10M indicates budget capacity; ideal $200K-$250K revenue per employee"
            },
            geography: {
              primary: "United States",
              concentrations: ["San Francisco Bay Area", "NYC", "Boston", "Austin", "Seattle", "Denver"]
            },
            business_model: "B2B companies with complex sales processes, long sales cycles, or multi-stakeholder deals",
            growth_rate: "20-50% annual growth (scaling phase - outgrown startup tools but not yet enterprise)"
          },
          industries: {
            strong_fit: [
              { name: "B2B SaaS & Software", notes: "Complex sales pipelines, product-led growth tracking, sophisticated integration needs" },
              { name: "Healthcare Technology & Digital Health", notes: "HIPAA compliance, patient management workflows, regulatory requirements" },
              { name: "Financial Services & Fintech", notes: "Regulatory compliance (SOC2, financial regs), client data security, audit trails" },
              { name: "Professional Services (Consulting, Legal, Agencies)", notes: "Complex client relationships, project tracking integration, relationship depth" },
              { name: "Real Estate (Brokerage, Property Management)", notes: "Industry-specific workflows (MLS integration, showing management, property tracking)" }
            ],
            moderate_fit: [
              { name: "Manufacturing with B2B Sales", notes: "Configure-price-quote needs, supply chain integration, ERP connectivity" },
              { name: "Wholesale & Distribution", notes: "Multi-channel sales, inventory integration, complex pricing models" },
              { name: "E-commerce & Digital Retail Platforms", notes: "Only if B2B component or enterprise complexity; avoid simple transactional B2C" },
              { name: "Recruiting & Staffing Agencies", notes: "Candidate pipeline tracking, placement management, ATS integration" }
            ],
            weak_fit: [
              { name: "Simple Transactional B2C", notes: "Avoid - well-served by Shopify/HubSpot, lacks complexity justifying custom" },
              { name: "Early-Stage Startups (<30 employees)", notes: "Avoid unless Series A+ funded with compliance requirements from day one" },
              { name: "Highly Decentralized Franchises", notes: "Avoid - lack central budget authority and standardization alignment" }
            ]
          },
          technographics: {
            positive_signals: {
              current_crm: ["HubSpot (outgrowing tiers)", "Salesforce (underutilized/complex)", "Pipedrive", "Zoho CRM", "Spreadsheets/manual processes"],
              pain_indicators: [
                "BuiltWith shows CRM tag removals",
                "Job posts for 'CRM Migration Manager'",
                "Multiple disconnected tools (5+ in tech stack)",
                "Complaints on G2/Capterra from company employees"
              ],
              tech_maturity_signals: [
                "Enterprise ERP (NetSuite, SAP, Dynamics, Epicor)",
                "Marketing automation (Marketo, Pardot, HubSpot MA)",
                "Custom internal tools mentioned in job posts",
                "API/integration roles posted"
              ]
            },
            negative_signals: [
              "Recently implemented Salesforce (<12 months)",
              "Multi-year contract signed with competitor (<18 months)",
              "No current CRM usage at scale",
              "Simple tech stack (<3 business systems)"
            ]
          },
          behavioral_signals: [
            "Funding announcements ($10M+ Series A/B/C within 18 months)",
            "5+ revenue role job postings simultaneously",
            "New RevOps/CRO hire in last 90 days",
            "Headcount growth 30%+ quarterly",
            "M&A announcement within 12 months",
            "Product launch or market expansion announced",
            "Compliance initiative visible (SOC2, HIPAA job posts)"
          ]
        },
        title_packs: {
          description: "Validated titles for champion, economic buyer, and technical evaluator personas",
          champion_titles: [
            "VP Revenue Operations", "VP of Revenue Operations", "Director of Revenue Operations", "Director Revenue Operations",
            "VP Sales Operations", "VP of Sales Operations", "Director of Sales Operations", "Director Sales Operations",
            "Head of Sales Enablement", "Head of Revenue Operations", "Chief Revenue Officer", "CRO",
            "VP of Business Operations", "VP Business Operations", "Director of Sales Strategy", "Director Sales Strategy",
            "Senior Manager Revenue Operations", "Manager of Sales Systems", "Manager Sales Systems", "Revenue Operations Manager"
          ],
          economic_buyer_titles: [
            "Chief Financial Officer", "CFO", "VP of Finance", "VP Finance", "Director of Finance", "Director Finance",
            "VP of Financial Planning & Analysis", "VP Financial Planning", "VP FP&A", "Controller", "Head of FP&A",
            "VP of Corporate Development", "VP Corporate Development", "Finance Director", "Senior Finance Manager",
            "Director of Business Operations", "Director Business Operations"
          ],
          technical_evaluator_titles: [
            "Chief Technology Officer", "CTO", "VP of Engineering", "VP Engineering", "VP of Information Technology",
            "VP Information Technology", "Director of IT", "Director IT", "IT Director", "Director of Engineering",
            "Director Engineering", "Head of Technology", "VP of Technical Operations", "VP Technical Operations",
            "Chief Information Officer", "CIO", "Enterprise Architect", "Director of Infrastructure",
            "Director Infrastructure", "VP of Product Engineering", "VP Product Engineering"
          ],
          titles_to_exclude: ["Assistant", "Associate", "Coordinator", "Intern", "Junior", "Board Member", "Board of Directors", "Advisor", "Consultant", "Contractor", "Freelance"]
        },
        exclusion_rules: [
          "Employee count <50 (Lacks operational complexity to justify custom CRM investment)",
          "Revenue <$10M annually (Insufficient budget capacity for $50K-$250K projects)",
          "Recently signed multi-year CRM contract <18 months ago (Contract lock-in prevents switching)",
          "Simple transactional B2C business model (Well-served by off-the-shelf platforms like Shopify)",
          "Pre-Series A or pre-revenue startup (Should use off-the-shelf until product-market fit achieved)",
          "Hiring freeze or budget freeze announced <6 months ago (Cost conservation mode, discretionary spending paused)",
          "Highly decentralized franchise model (Lacks central budget authority and requirement alignment)",
          "Enterprise 500+ employees undergoing cost reduction (Long procurement cycles, vendor consolidation focus)",
          "Standard sales processes without unique workflows (No justification for custom development)",
          "Posted 'Salesforce Administrator' role <3 months ago (Indicates recent platform commitment)",
          "Explicitly seeking off-the-shelf SaaS in job posts or RFPs (Fundamental solution approach misalignment)",
          "No technical maturity signals - lacks IT leadership (Cannot manage custom software vendor relationships)"
        ],
        segmentation_rules: {
          description: "Prioritized rules matching prospects to segments based on triggers and firmographics",
          rules: [
            {
              priority: 1,
              if: "Funding announcement $5M+ Series A or $15M+ Series B/C within past 18 months",
              and: "Headcount growth 20%+ quarterly OR 10+ revenue role job postings",
              then_segment: "Post-Funding Scale-Ups",
              then_priority: "High",
              best_angles: ["support_rapid_growth", "investor_ready_reporting", "scale_infrastructure", "eliminate_bottlenecks"]
            },
            {
              priority: 2,
              if: "Operates in healthcare, financial services, insurance, or legal industry",
              and: "Compliance job postings OR SOC2/HIPAA certifications visible OR regulatory news affecting sector",
              then_segment: "Compliance-Driven Enterprises",
              then_priority: "High",
              best_angles: ["regulatory_compliance", "risk_mitigation", "audit_readiness", "data_security"]
            },
            {
              priority: 3,
              if: "Job posting for 'CRM Migration' role OR negative CRM reviews from employees OR contract renewal window detected",
              and: "Current CRM identified (HubSpot/Salesforce/Zoho) AND employee count 100-500",
              then_segment: "CRM Migration Window Companies",
              then_priority: "Medium",
              best_angles: ["eliminate_frustration", "improve_adoption", "accurate_forecasting", "unified_customer_view"]
            },
            {
              priority: 4,
              if: "Tech stack shows 5+ business systems (ERP, billing, MA, support, analytics, proprietary tools)",
              and: "Job postings for Integration Specialist, Solutions Architect, or RevOps roles",
              then_segment: "Integration-Complex Operations",
              then_priority: "Medium",
              best_angles: ["eliminate_data_silos", "operational_efficiency", "single_source_of_truth", "workflow_automation"]
            },
            {
              priority: 5,
              if: "Industry = real estate, construction, recruiting, hospitality, non-profit, or education",
              and: "Currently using industry-specific CRM OR multiple locations/franchises OR revenue $10M-$75M",
              then_segment: "Industry-Specific Workflow Companies",
              then_priority: "Medium-Low",
              best_angles: ["industry_specific_optimization", "competitive_advantage", "process_excellence", "client_experience_differentiation"]
            },
            {
              priority: 6,
              if: "New VP/Director RevOps, Sales Ops, or CRO hire within past 90 days",
              and: "Employee count 100-500 AND revenue $20M+",
              then_segment: "CRM Migration Window Companies",
              then_priority: "High",
              best_angles: ["support_rapid_growth", "eliminate_frustration", "investor_ready_reporting"]
            },
            {
              priority: 7,
              if: "M&A announcement within past 12 months OR significant corporate restructuring",
              and: "Multiple legacy systems visible OR integration job postings",
              then_segment: "Integration-Complex Operations",
              then_priority: "High",
              best_angles: ["eliminate_data_silos", "single_source_of_truth", "unified_customer_view"]
            },
            {
              priority: 8,
              if: "Product launch announcement OR geographic expansion OR new market entry",
              and: "Revenue $20M+ AND current CRM = mid-tier platform",
              then_segment: "Post-Funding Scale-Ups",
              then_priority: "Medium",
              best_angles: ["scale_infrastructure", "support_rapid_growth", "operational_efficiency"]
            }
          ]
        },
        messaging_map: {
          description: "Persona + trigger combinations with tailored messaging angles",
          mappings: [
            {
              persona: "Champion (VP RevOps)",
              trigger_id: "Recent Funding Round",
              segment: "Post-Funding Scale-Ups",
              angle: "Scale revenue infrastructure before growth outpaces systems",
              hook: "Congrats on the {{funding_round}}! Most Series {{series}} companies hit CRM bottlenecks within 6 months as they scale from {{old_headcount}} to {{new_headcount}} reps.",
              pain_to_hit: "Sales reps spending 40-60% of time on manual data entry instead of selling; inaccurate forecasting creating board meeting challenges",
              proof_to_reference: "B2B SaaS case study: Series B company reduced rep admin time 65% and improved forecast accuracy to 92%",
              cta: "15-min call to share how similar growth-stage companies avoided CRM bottlenecks during scaling?"
            },
            {
              persona: "Economic Buyer (CFO)",
              trigger_id: "CRM Migration Window",
              segment: "CRM Migration Window Companies",
              angle: "3-5 year TCO advantage over subscription model with extensive customization",
              hook: "{{company}} is spending ${{crm_annual_cost}}/year on {{current_crm}}. If you're customizing heavily, you're likely approaching custom CRM break-even costs.",
              pain_to_hit: "Subscription costs plus customization fees exceed custom build over 3 years; ongoing per-user fees limiting scaling economics",
              proof_to_reference: "Financial services client TCO analysis: Custom CRM paid back in 22 months vs. Salesforce Financial Cloud with customizations",
              cta: "Share our TCO calculator to model your specific scenario?"
            },
            {
              persona: "Technical Buyer (CTO)",
              trigger_id: "Complex Tech Stack (5+ Systems)",
              segment: "Integration-Complex Operations",
              angle: "Purpose-built integrations eliminate brittle middleware and data sync failures",
              hook: "Noticed {{company}} runs {{erp_system}}, {{ma_platform}}, and {{support_platform}}. Zapier/Workato holding those together, or custom middleware?",
              pain_to_hit: "Integration middleware breaks frequently, can't handle complex workflows, creates data inconsistency across systems",
              proof_to_reference: "Manufacturing client: Replaced 47 Zapier workflows with native integrations, eliminated 90% of sync errors",
              cta: "20-min technical discussion on integration architecture with our lead solutions architect?"
            },
            {
              persona: "Champion (VP RevOps)",
              trigger_id: "New Executive Hire",
              segment: "CRM Migration Window Companies",
              angle: "Quick win opportunity to establish credibility in first 90 days",
              hook: "Congrats on joining {{company}}, {{first_name}}! Most new RevOps leaders inherit CRM tech debt. Curious what you're finding with {{current_crm}}?",
              pain_to_hit: "Low user adoption (<40%) inherited from predecessor; inability to deliver accurate reporting executives expect",
              proof_to_reference: "VP RevOps case study: Achieved 95% adoption within 4 months, became CEO's strategic advisor through data visibility",
              cta: "15-min exchange on what other new RevOps leaders tackled first?"
            },
            {
              persona: "Economic Buyer (CFO)",
              trigger_id: "Compliance Requirements",
              segment: "Compliance-Driven Enterprises",
              angle: "Risk mitigation investment with non-negotiable regulatory deadline",
              hook: "{{company}}'s {{compliance_requirement}} deadline is {{months}} months away. Off-the-shelf CRMs creating audit trail gaps or data handling concerns?",
              pain_to_hit: "Risk of fines, license revocation, or legal liability from CRM that can't meet compliance requirements",
              proof_to_reference: "Healthcare provider: Custom HIPAA-compliant CRM passed audit first time, avoided $500K+ in compliance consultant fees",
              cta: "Share compliance-specific case study and audit preparation checklist?"
            },
            {
              persona: "End User (VP Sales)",
              trigger_id: "Rapid Headcount Growth",
              segment: "Post-Funding Scale-Ups",
              angle: "Equip new sales team with intuitive tools instead of clunky enterprise software",
              hook: "Hiring {{new_hire_count}} AEs this quarter is exciting! What CRM are you onboarding them into - hoping it's not the Salesforce complexity nightmare?",
              pain_to_hit: "New reps taking 60-90 days to ramp on complex CRM; team bypassing system with spreadsheets creating forecast blindness",
              proof_to_reference: "SaaS sales team: Reduced rep onboarding from 8 weeks to 2 weeks with intuitive custom CRM, hit quota 30 days faster",
              cta: "10-min call to show how sales-first CRM design accelerates ramp time?"
            },
            {
              persona: "Technical Buyer (CTO)",
              trigger_id: "M&A Integration",
              segment: "Integration-Complex Operations",
              angle: "Unified system replacing disparate CRMs from acquired entities",
              hook: "{{acquisition_name}} acquisition means inheriting their {{acquired_crm}}. Planning to force-migrate to {{parent_crm}}, or opportunity to consolidate to purpose-built system?",
              pain_to_hit: "Multiple CRM platforms creating customer data fragmentation; inability to get unified view post-acquisition",
              proof_to_reference: "PE portfolio company: Unified 4 acquired companies onto single custom CRM in 6 months, enabled cross-sell revenue growth",
              cta: "Share M&A integration playbook from similar consolidation projects?"
            },
            {
              persona: "Champion (VP RevOps)",
              trigger_id: "Poor Adoption Signals",
              segment: "CRM Migration Window Companies",
              angle: "User adoption drives ROI - system must fit workflows, not force workarounds",
              hook: "Saw the G2 review from your team about {{current_crm}} being 'clunky' and 'too many clicks.' What's actual adoption rate vs. what you report to leadership?",
              pain_to_hit: "Sales team actively resisting CRM leading to incomplete data, inaccurate forecasting, management blind spots",
              proof_to_reference: "Professional services firm: Increased adoption from 32% to 94% by designing CRM around actual workflows instead of forcing Salesforce stages",
              cta: "15-min adoption audit to benchmark against industry standards?"
            }
          ]
        },
        qualification_criteria: {
          a_grade: {
            label: "Hot - Immediate Outreach",
            criteria: [
              "High-urgency trigger (funding, compliance deadline, new exec hire <90 days, M&A)",
              "Champion persona engaged or accessible",
              "Budget signals present (revenue $20M+, recent funding, allocated CRM budget)",
              "Timeline <6 months (fiscal year timing, compliance deadline, contract renewal)",
              "Strong firmographic fit (150-300 employees, $30M-$75M revenue, target industry)"
            ],
            expected_conversion: "40-60% to qualified meeting",
            action: "Immediate personalized outreach, multi-channel (email + LinkedIn), executive-level engagement, fast follow-up cadence"
          },
          b_grade: {
            label: "Warm - Standard Sequence",
            criteria: [
              "Medium-urgency trigger (product launch, growth milestone, tech stack expansion)",
              "Meets firmographic criteria (100-500 employees, $10M-$100M revenue)",
              "No immediate timeline but receptive signals (content engagement, job postings)",
              "Technical maturity signals present (ERP, MA platform, IT roles)"
            ],
            expected_conversion: "20-30% to qualified meeting",
            action: "Standard 8-touch sequence over 3 weeks, value-first approach, educational content, segment-specific case studies"
          },
          c_grade: {
            label: "Cold - Light Nurture",
            criteria: [
              "Low-urgency trigger (conference attendance, content downloads, growth milestone 12+ months old)",
              "Basic firmographic fit but missing key signals",
              "No active buying signals or timeline",
              "Potential future fit based on company trajectory"
            ],
            expected_conversion: "5-10% to qualified meeting",
            action: "Quarterly nurture emails, invite to webinars, monitor for trigger events, keep in CRM for future re-engagement"
          },
          disqualify: {
            label: "Disqualify - Remove from List",
            criteria: [
              "Employee count <50 or revenue <$10M (budget/complexity threshold)",
              "Recently signed multi-year contract with competitor <18 months ago",
              "Simple B2C transactional model without complexity",
              "Explicit budget constraints (<$25K stated budget)",
              "No executive sponsorship access after 3+ attempts",
              "Hiring freeze or cost-cutting mode announced",
              "Expressed satisfaction with current system, no pain articulated"
            ],
            action: "Remove from active prospecting, archive record, do not invest further resources unless major trigger event occurs"
          }
        },
        enrichment_checklist: {
          required_before_outreach: [
            { field: "verified_email_address", sources: ["Apollo.io", "ZoomInfo", "Hunter.io", "RocketReach"], must_verify: true },
            { field: "exact_title", sources: ["LinkedIn", "ZoomInfo", "company website"], must_verify: true },
            { field: "employee_count", sources: ["LinkedIn company page", "ZoomInfo", "Crunchbase"], must_verify: false },
            { field: "industry_classification", sources: ["LinkedIn", "company website", "Crunchbase"], must_verify: false },
            { field: "company_website", sources: ["LinkedIn", "Google search", "ZoomInfo"], must_verify: true },
            { field: "revenue_estimate", sources: ["ZoomInfo", "Crunchbase", "BuiltWith revenue estimates"], must_verify: false },
            { field: "headquarters_location", sources: ["LinkedIn", "ZoomInfo", "Crunchbase"], must_verify: false }
          ],
          required_for_segmentation: [
            { field: "current_crm_platform", sources: ["BuiltWith", "Datanyze", "job postings", "G2 reviews"], usage: "Identifies CRM Migration Window segment and pain point personalization" },
            { field: "funding_history", sources: ["Crunchbase", "PitchBook", "company press releases"], usage: "Identifies Post-Funding Scale-Ups segment and budget capacity signals" },
            { field: "recent_job_postings", sources: ["LinkedIn Jobs", "company careers page", "Indeed"], usage: "Detects growth signals, new exec hires, CRM migration roles, compliance initiatives" },
            { field: "technology_stack", sources: ["BuiltWith", "Datanyze", "job postings mentioning tools"], usage: "Identifies Integration-Complex Operations segment and integration pain points" },
            { field: "compliance_certifications", sources: ["Company website", "job postings", "press releases"], usage: "Identifies Compliance-Driven Enterprises segment and regulatory triggers" },
            { field: "growth_signals", sources: ["LinkedIn headcount tracking", "news mentions", "funding announcements"], usage: "Prioritizes high-urgency prospects experiencing scaling pain" }
          ],
          recommended_for_personalization: [
            { field: "recent_news_mentions", sources: ["Google News", "company blog", "LinkedIn company updates"], usage: "Personalized hooks referencing recent achievements or initiatives" },
            { field: "days_in_current_role", sources: ["LinkedIn profile", "job change tracking tools"], usage: "New exec trigger timing - prioritize 30-90 day window" },
            { field: "previous_company_tech_stack", sources: ["LinkedIn work history + BuiltWith crossmatch"], usage: "Identify if new exec came from company with custom CRM or sophisticated setup" },
            { field: "office_locations_count", sources: ["LinkedIn locations", "company website"], usage: "Multi-location complexity signals for Industry-Specific Workflow segment" },
            { field: "employee_reviews_sentiment", sources: ["Glassdoor", "G2 reviews from employees"], usage: "Identify CRM frustration or operational pain mentioned by employees" }
          ],
          enrichment_sequence: [
            "Step 1: Basic firmographics (employee count, revenue, industry, location) via ZoomInfo/Crunchbase",
            "Step 2: Contact data (email, title, LinkedIn URL) via Apollo.io, Hunter.io, or RocketReach",
            "Step 3: Technographics (current CRM, tech stack) via BuiltWith, Datanyze, job postings",
            "Step 4: Trigger detection (funding, job postings, news) via Crunchbase, LinkedIn, Google News",
            "Step 5: Personalization data (recent news, exec tenure, reviews) via manual research",
            "Step 6: Segment assignment based on rules + priority scoring for outreach order"
          ]
        },
        sales_handoff_template: {
          purpose: "Provide comprehensive context when handing booked meeting from SDR/BDR to Account Executive for discovery call",
          fields: {
            company_context: { company_name: "", website: "", employee_count: "", revenue_estimate: "", industry: "", current_crm: "", tech_signals: "" },
            contact_context: { name: "", title: "", linkedin: "", persona_type: "", days_in_role: "" },
            qualification_context: { segment: "", trigger_detected: "", trigger_details: "", pain_hypothesis: "", budget_signals: "", timeline_signals: "", qualification_grade: "" },
            outreach_context: { angle_used: "", hook_that_worked: "", reply_summary: "", questions_they_asked: "" },
            call_prep: { suggested_opening: "", discovery_questions: [], proof_to_have_ready: "", likely_objections: "", next_step_goal: "" }
          }
        },
        monitoring_alerts: {
          description: "Saved searches to identify new prospects matching ICP",
          crunchbase: {
            saved_search_name: "US Custom CRM Prospects - Funding Triggers",
            criteria: { location: "United States", employee_count: "50-500", funding_stage: ["Series A", "Series B", "Series C"], last_funding_date: "Last 90 days", industries: ["B2B SaaS", "Healthcare Technology", "Financial Technology"], revenue_range: "$10M-$100M" },
            frequency: "Weekly email digest",
            action: "Export new funded companies, enrich, prioritize by job postings, add to A-grade queue"
          },
          linkedin_sales_nav: {
            account_saved_search: { name: "ICP Accounts - Custom CRM Targets", criteria: "Headcount 100-500 | Industry: Software, IT, Financial, Healthcare, Legal | Revenue $10M-$100M | Location: SF, NYC, Boston, Austin, Seattle, Denver", use_for: "Weekly review of new ICP accounts; relationship mapping" },
            lead_alerts: { name: "New RevOps/CRO Hires at ICP Accounts", criteria: "Title: VP Revenue Ops, Director Revenue Ops, CRO, VP Sales Ops | Started role: Past 90 days | Company: 100-500 employees", frequency: "Daily alerts", action: "Immediate outreach within 30-45 days of hire" },
            hiring_signals: { name: "CRM Migration & Integration Job Posts", criteria: "Keywords: CRM Migration, Salesforce Admin, Integration Specialist | Company: 100-500 employees | Posted: 30 days", frequency: "Weekly digest", action: "Research tech stack, identify buyers, add to B-grade with migration angle" }
          },
          job_board_monitoring: { platforms: ["LinkedIn Jobs", "Indeed", "Greenhouse"], keywords: ["CRM Migration", "Revenue Operations", "Integration Specialist", "Salesforce Administrator"], filters: "100-500 employees, US locations, posted <30 days", frequency: "Bi-weekly", action: "Cross-reference CRM, prioritize outreach to hiring manager" },
          technographic_monitoring: { platform: "BuiltWith Pro or Datanyze", watch_for: ["CRM tag removals", "New MA platforms", "ERP implementations", "Multi-tool removals (consolidation)"], frequency: "Monthly", action: "Filter ICP companies, research context, segment with integration angle" }
        },
        market_sizing: {
          description: "Directional TAM estimate for mid-market companies in target verticals needing custom CRM solutions.",
          methodology: {
            approach: "Top-down analysis using US business census data filtered by employee count, industry segments, and CRM adoption rates.",
            how_to_replicate: [
              "Start with 123,185 US companies with 100-500 employees (NAICS 2024 data)",
              "Apply industry filters for B2B SaaS, fintech, healthcare tech, e-commerce, professional services (estimated 18-25% of total)",
              "Layer CRM adoption rates (82-94% for tech/healthcare sectors) to identify active CRM users",
              "Estimate 15-20% experience trigger events annually (growth, CRM migration, integration failures)"
            ],
            date_of_estimate: "2025-01-30",
            refresh_recommendation: "Update quarterly as NAICS releases new data and technology adoption rates shift with economic conditions."
          },
          estimates: {
            total_matching_firmographics: { range: "22,000-31,000", basis: "123,185 companies (100-500 employees) × 18-25% in target industries (B2B SaaS, fintech, healthcare tech, e-commerce, professional services)", confidence: "Medium" },
            with_relevant_technology: { range: "18,000-27,000", basis: "82-94% CRM adoption rate among tech and healthcare companies, applied to firmographic match (higher rate for SaaS/tech, lower for professional services)", confidence: "Medium" },
            with_active_trigger: { range: "2,700-5,400", basis: "15-20% experiencing annual trigger events: CRM migration, rapid growth, integration failures, compliance needs, or outgrowing current platform", confidence: "Low-Medium" },
            immediately_addressable: { range: "950-2,150", basis: "35-40% of triggered companies have budget allocated, executive buy-in, and are actively evaluating custom solutions vs alternatives within 6-month window", confidence: "Low" }
          },
          planning_implications: {
            for_campaign_planning: "Focus on companies showing growth signals (hiring, funding rounds, technology stack expansion) and CRM migration indicators. Expect 2-3% conversion from addressable market to qualified pipeline.",
            for_budget_planning: "Target 20-40 qualified opportunities annually from addressable market with 15-25% close rate. Average deal size $150K-$400K suggests $3M-10M revenue potential at scale.",
            data_quality_expectation: "Firmographic data highly reliable from NAICS; trigger event identification requires intent data enrichment and technographic monitoring for signal accuracy."
          }
        }
      }
    }
  }
};
