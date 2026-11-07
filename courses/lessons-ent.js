/* Lessons for Entrepreneurship. Steps are documented in study-lessons.js; `q` steps point at a
   question in the course's bank. Lesson ids are permanent. */
(window.STUDY_LESSONS = window.STUDY_LESSONS || {})['fbla-ent'] = [
  {
    id: 'ent-swot', unit: 'dis', title: 'Read the market before you build',
    steps: [
      { type: 'teach', title: 'Inside the company vs. outside it', body: 'A **SWOT** looks at a venture from four sides.\n\n**Strengths and weaknesses are internal.** You control them: your team, your costs, your patents.\n\n**Opportunities and threats are external.** You can only respond to them: new competitors, new laws, changing customers.\n\nThe test usually gives you a fact and asks you to classify it, so ask: "does the company control this?"' },
      { type: 'sort', prompt: 'Does the company control this, or does it come from outside?', buckets: ['Internal', 'External'], items: [
        ['A highly skilled founding team', 0, 'Yes. That\'s internal, so it\'s a strength.'],
        ['A new competitor is entering the market', 1, 'Yes. That\'s external, so it\'s a threat.'],
        ['The company relies on old equipment', 0, 'Yes. That\'s internal, so it\'s a weakness.'],
        ['A new law creates demand for your service', 1, 'Yes. That\'s external, so it\'s an opportunity.'],
        ['The aging population needs new services', 1, 'Yes. That\'s external, so it\'s an opportunity.']
      ]},
      { type: 'match', prompt: 'Which tool answers which question?', pairs: [
        ['Big-picture forces in a market', 'PESTLE'],
        ['Our internal and external position', 'SWOT'],
        ['How the business makes money, on one page', 'Business Model Canvas'],
        ['Will real users want this?', 'Minimum viable product']
      ], why: 'PESTLE only looks outward, while SWOT looks both inward and outward. That\'s a favorite distinction on tests.' },
      { type: 'q', ref: 'con-04' },
      { type: 'q', ref: 'dis-06' },
      { type: 'q', ref: 'dis-03' }
    ]
  },
  {
    id: 'ent-breakeven', unit: 'con', title: 'When does a business make money?',
    steps: [
      { type: 'teach', title: 'Two kinds of costs', body: '**Fixed costs** stay the same no matter how much you sell, like rent. **Variable costs** rise with each unit, like ingredients.\n\nEach sale first pays its own variable cost. What\'s left is the **contribution margin**, and it chips away at fixed costs.\n\n**Break-even = fixed costs ÷ (price − variable cost)**' },
      { type: 'widget', widget: 'break-even', title: 'Move the numbers', body: 'This startup has to sell 1,000 units a month just to break even.', goal: 'Your goal: use the sliders to get break-even down to **500 units or fewer**.', done: 'You did it. Notice there\'s more than one way: raise the price, cut unit cost or cut fixed costs.' },
      { type: 'q', ref: 'con-05' },
      { type: 'teach', title: 'Profit is not cash', body: 'A venture can be profitable on paper and still run out of money, because bills can come due before customers pay.\n\n**Runway = cash ÷ monthly net burn.** Net burn is expenses minus revenue, so don\'t divide by expenses alone. That\'s exactly the wrong answer a test will offer you.' },
      { type: 'q', ref: 'con-08' },
      { type: 'q', ref: 'con-02' }
    ]
  },
  {
    id: 'ent-risk', unit: 'con', title: 'Four ways to handle risk',
    steps: [
      { type: 'stages', title: 'Every risk has a right response', visual: 'risk-matrix', stages: [
        { name: 'Avoid', text: 'When a loss would be **frequent and severe**, don\'t do the activity at all. A startup might drop a product line that\'s too dangerous.' },
        { name: 'Reduce', text: 'When small losses happen **often**, make them less likely or smaller. Think safety training, or cameras to deter theft.' },
        { name: 'Transfer', text: 'When a loss would be **rare but devastating**, move it to someone else. Insurance is the classic example, as with a warehouse fire.' },
        { name: 'Retain', text: 'When a loss is **rare and small**, accept it and pay for it yourself. Insuring a stapler isn\'t worth it.' }
      ]},
      { type: 'match', prompt: 'Which strategy is the business using?', pairs: [
        ['Buys fleet insurance', 'Transfer'],
        ['Installs driver safety systems', 'Reduce'],
        ['Decides not to sell a risky product', 'Avoid'],
        ['Absorbs small breakage costs', 'Retain']
      ], why: 'Insurance transfers risk. It doesn\'t reduce the chance of the accident happening.' },
      { type: 'sort', prompt: 'Insurance generally covers only one of these two types. Which type is each?', buckets: ['Pure risk', 'Speculative risk'], items: [
        ['A warehouse might catch fire', 0, 'Yes. It can only bring a loss, so it can usually be insured.'],
        ['Launching a new product', 1, 'Yes. It could bring profit or loss.'],
        ['An employee might get injured', 0, 'Yes. It can only bring a loss.'],
        ['Entering a new market', 1, 'Yes. It could bring profit or loss.']
      ]},
      { type: 'q', ref: 'con-10' },
      { type: 'q', ref: 'con-11' }
    ]
  },
  {
    id: 'ent-ip', unit: 'con', title: 'Protecting what you create',
    steps: [
      { type: 'teach', title: 'Match the protection to the thing', body: '**Patent:** an invention. Generally lasts 20 years, and you must disclose how it works.\n\n**Trademark:** a brand identifier, like a name or logo.\n\n**Copyright:** creative work, like writing, music or code.\n\n**Trade secret:** valuable private information, like a formula. It lasts as long as it stays secret.' },
      { type: 'match', prompt: 'Which protection fits?', pairs: [
        ['A new mechanical device', 'Patent'],
        ['A company\'s logo', 'Trademark'],
        ['A training manual\'s text', 'Copyright'],
        ['A secret drink formula', 'Trade secret']
      ], why: 'A patent makes you publish your invention and it expires, which is why some companies prefer keeping a formula secret.' },
      { type: 'q', ref: 'con-18' },
      { type: 'q', ref: 'con-17' },
      { type: 'q', ref: 'con-19' }
    ]
  },
  {
    id: 'ent-funding', unit: 'res', title: 'Where start-up money comes from',
    steps: [
      { type: 'stages', title: 'Climbing the funding ladder', visual: 'funding-ladder', stages: [
        { name: 'Savings and early sales', text: '**Bootstrapping** keeps full ownership and adds no debt. The tradeoff is that limited cash can slow growth.' },
        { name: 'Friends and family', text: 'A quick source of small amounts on flexible terms. The risk is damaging relationships, so put it in writing.' },
        { name: 'Bank and SBA loans', text: '**Debt:** you keep ownership but must repay it. The SBA generally guarantees part of a bank\'s loan, rather than lending directly.' },
        { name: 'Angel investors', text: '**Equity:** wealthy individuals invest their **own** money early on, and often mentor founders too.' },
        { name: 'Venture capital', text: '**Equity:** firms invest **pooled** funds in high-growth companies, in larger amounts, and often take board seats.' }
      ]},
      { type: 'sort', prompt: 'Debt or equity?', buckets: ['Debt', 'Equity'], items: [
        ['Must be repaid, with interest', 0, 'Yes. Debt has to be repaid no matter how the business does.'],
        ['The investor owns part of the company', 1, 'Yes. Equity shares ownership and profits.'],
        ['An SBA-backed loan', 0, 'Yes. The guarantee doesn\'t change the fact that you owe it.'],
        ['Selling 20% of the company to an angel', 1, 'Yes. Nothing is repaid, but your ownership is diluted.']
      ]},
      { type: 'teach', title: 'The valuation math', body: 'If an investor pays **$200,000 for 20%**, the company is valued at $200,000 ÷ 0.20 = **$1,000,000 post-money**.\n\nPost-money includes the new cash. Subtract the investment to get **$800,000 pre-money**.' },
      { type: 'q', ref: 'res-03' },
      { type: 'q', ref: 'res-07' },
      { type: 'q', ref: 'res-04' }
    ]
  }
];
