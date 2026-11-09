export const acceptedToolSalaries = [
  { text: '50,000', employeeNI: '£2,994' },
  { text: '50000.50', employeeNI: '£2,994' },
  { text: '30,000.50', employeeNI: '£1,394' },
  // £1,394.50 rounds to £1,395 for display; dropping the pence would give £1,394.
  { text: '£30,001.25', employeeNI: '£1,395' },
] as const;

export const rejectedToolSalaries = [
  { text: '-5000', message: /Negative amounts are not supported/ },
  { text: '30k', message: /Enter an amount in pounds and pence/ },
  { text: '£1,2,3', message: /Use commas only to separate thousands/ },
  { text: '', message: /Enter .*annual (salary|income)/ },
  { text: 'salary', message: /Enter an amount in pounds and pence/ },
  { text: '30000.123', message: /no more than 2 decimal places/ },
] as const;
