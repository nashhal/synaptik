# Synaptik — Developer Demo Script

## Objective
Demonstrate that Synaptik can answer a real business question across disconnected systems and show exactly where the answer came from.

## Setup
Sources:
- Google Sheets: sales
- QuickBooks: invoices and payments

Demo records:
- Ahmed: 18,500 + 7,200 SAR sales; 25,700 SAR invoice; 12,000 SAR paid.
- Sara: 9,100 SAR sales; 9,100 SAR invoice; 9,100 SAR paid.

## Demo sequence
### 1. Open workspace
Start on Search. Do not explain the UI first; let the product tell the story.

### 2. Ask the cross-source question
`كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟`

The UI must visibly show:
1. Understanding question
2. Searching sources
3. Resolving Ahmed
4. Calculating
5. Building answer

### 3. Show the answer
- Sales: 25,700 SAR
- Paid: 12,000 SAR
- Outstanding: 13,700 SAR

### 4. Show calculation
`25,700 - 12,000 = 13,700 SAR`

Explain that arithmetic is calculated from structured facts, not invented by the language model.

### 5. Open Evidence
Show the two Google Sheets sales records and the QuickBooks invoice/payment records.

### 6. Ask a follow-up
`قارن أحمد وسارة`

Expected table:
| Customer | Sales | Paid | Outstanding |
|---|---:|---:|---:|
| Ahmed | 25,700 | 12,000 | 13,700 |
| Sara | 9,100 | 9,100 | 0 |

### 7. Demonstrate source health
Open Sources. Show Google Sheets and QuickBooks as Connected and their sync metadata.

### 8. Demonstrate trust
Open Customers to show that the same customer can be linked across sources. Open Activity to show query/audit metrics.

## Failure demo
Temporarily make QuickBooks unavailable. Ask for Ahmed's paid amount. The product must return a partial-data warning and must not fabricate the payment or outstanding balance.

## Closing statement
Synaptik is not another chatbot. It is a search and reasoning layer over business systems: one question, multiple sources, structured facts, validated calculations, and evidence.
