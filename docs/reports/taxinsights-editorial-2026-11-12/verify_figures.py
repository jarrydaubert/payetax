#!/usr/bin/env python3
"""Independent check of every figure in the rewritten £40k article (JGF-92 review draft).

Inputs are official published values read from GOV.UK / ONS on 12 November 2026 (URLs below),
not values taken from the PayeTax engine. Results are then compared with the repo's existing
hand-derived fixture (salary-guides-payroll-2026-27.json at origin/main), and every £ amount,
pence amount and percentage in the rewritten body is checked against the verified set.

Usage: python3 verify_figures.py <rewrite.mdx> <fixture.json>
"""
import json, re, sys
from decimal import Decimal as D, ROUND_FLOOR, ROUND_CEILING, ROUND_HALF_UP, ROUND_HALF_DOWN

# --- Official inputs -------------------------------------------------------------------
# https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027 (updated 1 Sep 2026)
PA_ANNUAL = D(12570); BASIC_RATE = D('0.20'); BASIC_BAND = D(37700)
NI_PT_MONTH = D(1048); NI_PT_ANNUAL = D(12570); NI_UEL_ANNUAL = D(50270); NI_MAIN = D('0.08')
PLAN2_ANNUAL = D(29385); PLAN2_MONTH = D('2448.75'); SL_RATE = D('0.09')
# SL3 2026-27 tables: "Multiply the excess by 9%, round down to the nearest whole pound"
# https://www.ons.gov.uk/.../annualsurveyofhoursandearnings/2026 (released 22 Oct 2026, provisional)
ONS_MEDIAN = D(40911)

p2 = lambda x, mode=ROUND_HALF_UP: x.quantize(D('0.01'), rounding=mode)
floor_pound = lambda x: x.quantize(D('1'), rounding=ROUND_FLOOR)

def free_pay_month(code_number: int) -> D:
    """HMRC Tables A method: codes above 500 split into 500-blocks plus remainder code."""
    q, r = divmod(code_number - 1, 500)
    rem = r + 1
    block = p2(D(5000) / 12, ROUND_CEILING)                 # 416.67
    return p2(D(rem * 10 + 9) / 12, ROUND_CEILING) + q * block

def month(salary: D, plan2=False):
    gross = p2(salary / 12)
    fp = free_pay_month(1257)
    tax = floor_pound(gross - fp) * BASIC_RATE              # taxable pay rounded down to whole £
    ni = p2((gross - NI_PT_MONTH) * NI_MAIN, ROUND_HALF_DOWN)  # nearest penny, exact half down
    sl = floor_pound((gross - PLAN2_MONTH) * SL_RATE) if plan2 else D(0)
    return dict(gross=gross, free_pay=fp, tax=tax, ni=ni, sl=sl, net=gross - tax - ni - sl)

S = D(40000)
base, plan2, sac, rise = month(S), month(S, plan2=True), month(S - S * D('0.05')), month(D(41000))
yr = lambda m, k: m[k] * 12
base_net_y = S - yr(base, 'tax') - yr(base, 'ni')
plan2_net_y = base_net_y - yr(plan2, 'sl')
sac_net_y = D(38000) - yr(sac, 'tax') - yr(sac, 'ni')
ann_tax = (S - PA_ANNUAL) * BASIC_RATE; ann_ni = (S - NI_PT_ANNUAL) * NI_MAIN; ann_net = S - ann_tax - ann_ni

# Sensitivity: tax is unchanged if free pay is taken as 12570/12 instead of the Tables A value
alt_tax = floor_pound(base['gross'] - p2(PA_ANNUAL / 12)) * BASIC_RATE
assert alt_tax == base['tax'], 'headline tax is sensitive to the free-pay method'
assert PA_ANNUAL + BASIC_BAND == NI_UEL_ANNUAL == D(50270)
assert S < PA_ANNUAL + BASIC_BAND and D(41000) < PA_ANNUAL + BASIC_BAND

derived = [
 # (label, value, how it is shown in the article, source of the claim)
 ('Monthly Income Tax',            base['tax'],              '£457',       'fixture'),
 ('Monthly employee NI',           base['ni'],               '£183',       'fixture'),
 ('Annual Income Tax',             yr(base,'tax'),           '£5,484 / £5,484.00', 'fixture'),
 ('Annual employee NI',            yr(base,'ni'),            '£2,194 / £2,193.96', 'fixture'),
 ('Annual take-home',              base_net_y,               '£32,322 / £32,322.04', 'fixture'),
 ('Monthly take-home',             base_net_y/12,            '£2,694',     'fixture'),
 ('Monthly gross',                 S/12,                     '£3,333',     'fixture'),
 ('Monthly NI primary threshold',  NI_PT_MONTH,              '£1,048',     'NEW in rewrite'),
 ('Deductions as share of gross',  (yr(base,'tax')+yr(base,'ni'))/S*100, 'about 19p in the pound', 'NEW in rewrite'),
 ('Marginal keep per extra £1',    (1-BASIC_RATE-NI_MAIN)*100, '72p (20p + 8p)', 'NEW in rewrite'),
 ('Check: net gain on +£1,000 (monthly model)', (D(41000)-yr(rise,'tax')-yr(rise,'ni'))-base_net_y, 'supports 72p claim', 'NEW in rewrite'),
 ('Basic-rate ceiling',            PA_ANNUAL+BASIC_BAND,     '£50,270',    'NEW in rewrite'),
 ('Plan 2 monthly deduction',      plan2['sl'],              '£79',        'fixture'),
 ('Plan 2 annual deduction',       yr(plan2,'sl'),           '£948',       'fixture'),
 ('Plan 2 annual take-home',       plan2_net_y,              '£31,374',    'fixture'),
 ('Plan 2 monthly take-home',      plan2_net_y/12,           '£2,615',     'fixture'),
 ('Sacrifice: pension per year',   S*D('0.05'),              '£2,000',     'fixture'),
 ('Sacrifice: pension per month',  S*D('0.05')/12,           '£167',       'NEW in rewrite'),
 ('Sacrifice: cash pay',           S-S*D('0.05'),            '£38,000',    'fixture'),
 ('Sacrifice annual take-home',    sac_net_y,                '£30,883',    'fixture'),
 ('Sacrifice monthly take-home',   sac_net_y/12,             '£2,574',     'fixture'),
 ('Sacrifice: monthly take-home drop', (base_net_y-sac_net_y)/12, '£120',  'NEW in rewrite'),
 ('Sacrifice: monthly tax+NI not paid', S*D('0.05')/12-(base_net_y-sac_net_y)/12, '£47', 'NEW in rewrite'),
 ('Annual illustration: taxable',  S-PA_ANNUAL,              '£27,430',    'fixture'),
 ('Annual illustration: tax',      ann_tax,                  '£5,486.00',  'fixture'),
 ('Annual illustration: NI',       ann_ni,                   '£2,194.40',  'fixture'),
 ('Annual illustration: net',      ann_net,                  '£32,319.60', 'fixture'),
 ('Monthly model minus annual',    base_net_y-ann_net,       '£2.44',      'NEW in rewrite'),
 ('ONS median minus £40,000',      ONS_MEDIAN-S,             '£911',       'article + ONS'),
]
print(f"{'Figure':46} {'Derived':>12}  {'Shown as':24} Origin")
for label, v, shown, origin in derived:
    print(f"{label:46} {p2(v):>12}  {shown:24} {origin}")

# --- Compare with the repo's existing hand-derived fixture --------------------------------
fx = {s['id']: s for s in json.load(open(sys.argv[2], encoding='utf-8'))['scenarios']}
def same(a, b): return abs(D(str(a)) - D(str(b))) <= D('0.02')
checks = [
 ('base tax/yr', yr(base,'tax'), fx['salary-guide-40k-base']['expected']['incomeTaxAnnual']),
 ('base NI/yr', yr(base,'ni'), fx['salary-guide-40k-base']['expected']['nationalInsuranceAnnual']),
 ('base net/yr', base_net_y, fx['salary-guide-40k-base']['expected']['netPayAnnual']),
 ('annual illus. net', ann_net, fx['salary-guide-40k-base']['annualIllustration']['netPay']),
 ('plan2 SL/month', plan2['sl'], fx['salary-guide-40k-plan2']['expected']['studentLoanMonthly']),
 ('plan2 net/yr', plan2_net_y, fx['salary-guide-40k-plan2']['expected']['netPayAnnual']),
 ('sacrifice tax/yr', yr(sac,'tax'), fx['salary-guide-40k-sacrifice']['expected']['incomeTaxAnnual']),
 ('sacrifice NI/yr', yr(sac,'ni'), fx['salary-guide-40k-sacrifice']['expected']['nationalInsuranceAnnual']),
 ('sacrifice net/yr', sac_net_y, fx['salary-guide-40k-sacrifice']['expected']['netPayAnnual']),
]
print('\nAgainst existing fixture (tolerance 2p):')
bad = 0
for label, mine, theirs in checks:
    ok = same(mine, theirs); bad += not ok
    print(f"  {'OK ' if ok else 'DIFF'} {label:20} derived {p2(mine):>10}  fixture {theirs}")

# --- Every figure in the rewritten body must be in the verified set ------------------------
body = re.split(r'^---\s*$', open(sys.argv[1], encoding='utf-8').read(), maxsplit=2, flags=re.M)[2]
body_no_urls = re.sub(r'\]\([^)]*\)', ']', body)
verified_money = {'40,000','32,322','2,694','457','183','5,484','2,194','3,333','12,570','50,270','29,385',
 '2,448.75','79','948','2,615','31,374','2,000','38,000','2,574','30,883','167','120','47','40,911','911',
 '2.44','1,048','5,484.00','2,193.96','32,322.04','5,486.00','2,194.40','32,319.60','27,430','1'}
verified_pct = {'9','5','20','8','40'}
verified_pence = {'19','72','20','8'}
money = set(re.findall(r'£(\d{1,3}(?:,\d{3})*(?:\.\d+)?)', body_no_urls))
pct = set(re.findall(r'(\d+(?:\.\d+)?)%', body_no_urls))
pence = set(re.findall(r'\b(\d+)p\b', body_no_urls))
print('\nFigures in rewritten body:', len(money), 'money,', len(pct), 'percent,', len(pence), 'pence')
for name, found, allowed in (('money', money, verified_money), ('percent', pct, verified_pct), ('pence', pence, verified_pence)):
    extra = sorted(found - allowed)
    print(f"  {name}: {'all verified' if not extra else 'UNVERIFIED ' + str(extra)}")
    bad += bool(extra)
print('\nRESULT:', 'PASS' if not bad else 'FAIL')
sys.exit(1 if bad else 0)
