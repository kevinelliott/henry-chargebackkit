export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
export type Category = 'Fraud' | 'Authorization' | 'Processing Error' | 'Consumer';

export interface ReasonCode {
  code: string;
  network: 'visa' | 'mastercard';
  name: string;
  category: Category;
  difficulty: Difficulty;
  winRateBenchmark: number;
  description: string;
  requiredEvidence: string[];
  optionalEvidence: string[];
  responseStrategy: string;
  commonMistakes: string[];
}

export const REASON_CODES: ReasonCode[] = [
  {
    code: '10.1',
    network: 'visa',
    name: 'EMV Liability Shift Counterfeit',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 25,
    description: 'Fraudulent transaction using counterfeit card at EMV-capable terminal that did not process chip.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match', 'billing_descriptor'],
    optionalEvidence: ['prior_transactions', 'customer_communication'],
    responseStrategy: 'For EMV liability shift cases, demonstrate that your terminal was chip-enabled and the transaction was processed correctly. Provide the full transaction receipt showing chip read status. If the card was swiped rather than dipped, acknowledge this but provide all other supporting evidence showing the legitimacy of the transaction.',
    commonMistakes: ['Not providing terminal capability proof', 'Missing transaction receipt with EMV data', 'Failing to show CVV match']
  },
  {
    code: '10.2',
    network: 'visa',
    name: 'EMV Liability Shift Non-Counterfeit',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 20,
    description: 'Fraudulent transaction at EMV-capable terminal where non-counterfeit card was used.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['prior_transactions', 'billing_descriptor'],
    responseStrategy: 'Similar to 10.1 but involves a genuine card used fraudulently. Focus on demonstrating that all security measures were followed at point of sale. Provide evidence of chip processing if available, and show that the merchant met all authorization requirements.',
    commonMistakes: ['Not distinguishing from counterfeit fraud', 'Missing authorization codes', 'Inadequate terminal documentation']
  },
  {
    code: '10.3',
    network: 'visa',
    name: 'Other Fraud — Card Present',
    category: 'Fraud',
    difficulty: 'Medium',
    winRateBenchmark: 35,
    description: 'Fraudulent card-present transaction not covered by other reason codes.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match', 'signed_contract'],
    optionalEvidence: ['customer_communication', 'prior_transactions'],
    responseStrategy: 'For card-present fraud, your strongest evidence is the signed receipt and any CCTV or physical evidence of the cardholder being present. Provide a complete transaction receipt with the cardholder signature. If you have security camera footage showing the customer, reference it. Demonstrate that standard card-present verification procedures were followed.',
    commonMistakes: ['Missing signed receipt', 'No cardholder verification documentation', 'Failing to provide complete POS data']
  },
  {
    code: '10.4',
    network: 'visa',
    name: 'Other Fraud — Card Absent',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 30,
    description: 'Fraudulent card-not-present (online/phone) transaction. The most common chargeback reason code.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['prior_transactions', 'customer_communication', 'delivery_proof', 'usage_logs'],
    responseStrategy: 'Card-absent fraud chargebacks require a multi-layered defense. Provide: (1) Full AVS and CVV match confirmation from your processor, (2) IP address of the order matching the cardholder billing address region, (3) Device fingerprint data showing consistent device usage, (4) Order confirmation emails sent to the cardholder email on file, (5) Delivery confirmation with matching shipping address. If this is a digital product, provide usage logs showing the product was accessed. Prior successful transactions from the same customer strengthen your case significantly.',
    commonMistakes: ['Not providing AVS/CVV match data', 'Missing IP address documentation', 'No delivery confirmation', 'Failing to show prior transaction history']
  },
  {
    code: '10.5',
    network: 'visa',
    name: 'Visa Fraud Monitoring Program',
    category: 'Fraud',
    difficulty: 'Very Hard',
    winRateBenchmark: 10,
    description: 'Merchant flagged under Visa Fraud Monitoring Program. Extremely difficult to contest.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['prior_transactions', 'signed_contract', 'customer_communication'],
    responseStrategy: 'VFMP disputes are among the hardest to win. Your response must be comprehensive and demonstrate exceptional fraud prevention measures. Provide all available security data: AVS/CVV results, 3D Secure authentication, IP analysis, device fingerprinting, and velocity checks. Show that your fraud screening was thorough and that this transaction passed all reasonable checks. Consider consulting with your payment processor for additional guidance.',
    commonMistakes: ['Insufficient fraud prevention documentation', 'Missing 3DS authentication data', 'No velocity check records', 'Underestimating difficulty level']
  },
  {
    code: '11.1',
    network: 'visa',
    name: 'Card Recovery Bulletin',
    category: 'Authorization',
    difficulty: 'Medium',
    winRateBenchmark: 40,
    description: 'Card was on the Card Recovery Bulletin (blocked card list) at time of transaction.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['billing_descriptor', 'prior_transactions'],
    responseStrategy: 'Demonstrate that authorization was obtained and approved at the time of the transaction. If the authorization was approved, your processor should have flagged the card status. Provide the full authorization response showing approval code.',
    commonMistakes: ['Missing authorization approval code', 'Not checking card status at time of auth']
  },
  {
    code: '11.2',
    network: 'visa',
    name: 'Declined Authorization',
    category: 'Authorization',
    difficulty: 'Easy',
    winRateBenchmark: 60,
    description: 'Transaction processed after authorization was declined.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor'],
    responseStrategy: 'If you believe authorization was actually approved, provide the authorization code from your processor. If there was a system error, provide documentation of the error and the subsequent approval. Declined authorization chargebacks are often straightforward to resolve with proper documentation.',
    commonMistakes: ['Not having the authorization approval code', 'Confusing decline with timeout']
  },
  {
    code: '11.3',
    network: 'visa',
    name: 'No Authorization',
    category: 'Authorization',
    difficulty: 'Easy',
    winRateBenchmark: 65,
    description: 'Transaction processed without obtaining proper authorization.',
    requiredEvidence: ['transaction_receipt', 'billing_descriptor'],
    optionalEvidence: ['avs_cvv_match'],
    responseStrategy: 'Provide the authorization code obtained for this transaction. If authorization was obtained via a different method (phone, paper), document this thoroughly. For transactions processed under a blanket authorization, provide evidence of the authorization agreement.',
    commonMistakes: ['Not retaining authorization codes', 'Missing transaction receipts with auth codes']
  },
  {
    code: '12.1',
    network: 'visa',
    name: 'Late Presentment',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 55,
    description: 'Transaction submitted for processing beyond the allowed timeframe.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor', 'customer_communication'],
    responseStrategy: 'Provide documentation showing the transaction was submitted within the required timeframe, or explain any delays with supporting documentation. If the delay was due to circumstances outside your control, document this clearly.',
    commonMistakes: ['Not documenting submission dates', 'Missing timestamps on processing records']
  },
  {
    code: '12.2',
    network: 'visa',
    name: 'Incorrect Transaction Code',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 60,
    description: 'Wrong transaction type code was used (e.g., credit instead of debit).',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor'],
    responseStrategy: 'Show that the correct transaction code was used, or if an error occurred, provide documentation of the correction. Processing error chargebacks often have clear-cut resolutions.',
    commonMistakes: ['Not having transaction code documentation', 'Missing processing records']
  },
  {
    code: '12.3',
    network: 'visa',
    name: 'Incorrect Currency',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 60,
    description: 'Transaction processed in incorrect currency.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor', 'customer_communication'],
    responseStrategy: 'Provide documentation showing the correct currency was used and the cardholder was informed of the currency at time of purchase. If DCC (Dynamic Currency Conversion) was offered, show the cardholder accepted.',
    commonMistakes: ['Missing currency disclosure documentation', 'No DCC acceptance record']
  },
  {
    code: '12.4',
    network: 'visa',
    name: 'Incorrect Account Number',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 55,
    description: 'Transaction applied to wrong account number.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor'],
    responseStrategy: 'Provide the transaction receipt showing the correct account number was used, or documentation showing the account number match. For keyed transactions, provide additional verification that the account number entered matches the disputed card.',
    commonMistakes: ['Inadequate account verification documentation']
  },
  {
    code: '12.5',
    network: 'visa',
    name: 'Incorrect Amount',
    category: 'Processing Error',
    difficulty: 'Medium',
    winRateBenchmark: 45,
    description: 'Transaction amount differs from the authorized or agreed amount.',
    requiredEvidence: ['transaction_receipt', 'signed_contract'],
    optionalEvidence: ['customer_communication', 'billing_descriptor'],
    responseStrategy: 'Provide the original order confirmation showing the correct amount, and the signed receipt or agreement showing the cardholder accepted this amount. If any adjustments were made (tips, modifications), provide documentation of cardholder authorization for the final amount.',
    commonMistakes: ['Missing original authorization amount', 'No documentation of amount adjustments']
  },
  {
    code: '12.6',
    network: 'visa',
    name: 'Duplicate Processing',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 65,
    description: 'Transaction was processed more than once for the same sale.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor', 'customer_communication'],
    responseStrategy: 'Demonstrate that the transactions were for separate, legitimate purchases — not duplicates. Provide transaction receipts for each charge showing different order IDs, dates, or products. If a legitimate duplicate occurred, provide evidence you have already issued a refund.',
    commonMistakes: ['Not demonstrating transactions were distinct', 'Missing separate order documentation']
  },
  {
    code: '12.7',
    network: 'visa',
    name: 'Invalid Data',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 55,
    description: 'Required transaction data was missing or invalid.',
    requiredEvidence: ['transaction_receipt'],
    optionalEvidence: ['billing_descriptor'],
    responseStrategy: 'Provide complete transaction data showing all required fields were present and valid. If data was truncated or missing due to a system issue, document the error and provide the complete data separately.',
    commonMistakes: ['Not providing complete transaction records']
  },
  {
    code: '13.1',
    network: 'visa',
    name: 'Merchandise/Services Not Received',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 42,
    description: 'Cardholder claims merchandise or services were not received.',
    requiredEvidence: ['delivery_proof', 'transaction_receipt', 'customer_communication'],
    optionalEvidence: ['signed_contract', 'usage_logs', 'refund_policy'],
    responseStrategy: 'Your strongest evidence is proof of delivery. For physical goods, provide: (1) Tracking number with carrier confirmation of delivery, (2) Delivery confirmation signature if available, (3) Photos of delivered package if available. For digital goods or services, provide: access logs showing the service was used, download records, or service delivery confirmation. Always include order confirmation emails sent to the customer and any communication showing the customer acknowledged receipt.',
    commonMistakes: ['Missing carrier tracking with delivery confirmation', 'No proof of delivery to billing address', 'Failing to show customer communication confirming receipt']
  },
  {
    code: '13.2',
    network: 'visa',
    name: 'Cancelled Recurring Transaction',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 38,
    description: 'Cardholder claims they cancelled a recurring billing subscription.',
    requiredEvidence: ['signed_contract', 'customer_communication', 'refund_policy'],
    optionalEvidence: ['transaction_receipt', 'usage_logs'],
    responseStrategy: 'Demonstrate that: (1) The subscription was not cancelled prior to the billing date, (2) You have a clear cancellation policy that was disclosed to the cardholder, (3) If you received a cancellation request, it was after the billing cycle cutoff. Provide the original subscription agreement signed by the cardholder, all billing communications, and your cancellation confirmation records. Show any usage logs demonstrating the service was accessed during the disputed billing period.',
    commonMistakes: ['No clear cancellation policy', 'Missing subscription agreement', 'Not showing cancellation request was received after billing']
  },
  {
    code: '13.3',
    network: 'visa',
    name: 'Not as Described',
    category: 'Consumer',
    difficulty: 'Hard',
    winRateBenchmark: 28,
    description: 'Merchandise or services did not match the description provided at time of sale.',
    requiredEvidence: ['signed_contract', 'customer_communication', 'transaction_receipt'],
    optionalEvidence: ['delivery_proof', 'refund_policy', 'usage_logs'],
    responseStrategy: 'Contest this by providing: (1) The original product listing/description that exactly matches what was delivered, (2) Evidence the customer received exactly what was ordered, (3) Communications where the customer may have acknowledged receipt without complaint, (4) Your return/refund policy. If the customer contacted you about the issue, show how it was resolved. Screenshots of product listings at time of purchase are particularly valuable.',
    commonMistakes: ['Not preserving product listing screenshots', 'Missing customer communication history', 'Inadequate return policy documentation']
  },
  {
    code: '13.4',
    network: 'visa',
    name: 'Counterfeit Merchandise',
    category: 'Consumer',
    difficulty: 'Hard',
    winRateBenchmark: 22,
    description: 'Cardholder claims merchandise received was counterfeit.',
    requiredEvidence: ['signed_contract', 'customer_communication', 'transaction_receipt'],
    optionalEvidence: ['delivery_proof', 'refund_policy'],
    responseStrategy: 'Provide documentation of your merchandise authenticity: manufacturer invoices, authenticity certificates, authorized reseller agreements, or brand authorization letters. Demonstrate that you are an authorized seller of the goods in question. This is challenging without strong supplier documentation.',
    commonMistakes: ['No authenticity documentation', 'Missing supplier/manufacturer agreements', 'Not being an authorized reseller']
  },
  {
    code: '13.5',
    network: 'visa',
    name: 'Misrepresentation',
    category: 'Consumer',
    difficulty: 'Hard',
    winRateBenchmark: 25,
    description: 'Merchant misrepresented goods, services, or terms of the transaction.',
    requiredEvidence: ['signed_contract', 'customer_communication', 'refund_policy'],
    optionalEvidence: ['transaction_receipt', 'delivery_proof'],
    responseStrategy: 'Provide your complete terms and conditions as shown at checkout, screenshots of your product/service description, and any customer acknowledgments. Show that all material terms were clearly disclosed before purchase. Customer communication showing understanding of the terms is particularly helpful.',
    commonMistakes: ['No terms and conditions documentation', 'Missing disclosure acknowledgment', 'Unclear pricing or service terms']
  },
  {
    code: '13.6',
    network: 'visa',
    name: 'Credit Not Processed',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 40,
    description: 'Refund or credit was promised but not processed.',
    requiredEvidence: ['customer_communication', 'transaction_receipt'],
    optionalEvidence: ['refund_policy'],
    responseStrategy: 'If a refund was issued, provide proof of the refund transaction with date and amount. If a refund was not promised, show all customer communications demonstrating no refund commitment was made. Include your return/refund policy and show it was properly disclosed.',
    commonMistakes: ['Not providing refund transaction documentation', 'Missing customer communication showing no refund was promised']
  },
  {
    code: '13.7',
    network: 'visa',
    name: 'Cancelled Merchandise/Services',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 35,
    description: 'Cardholder cancelled order but was still charged.',
    requiredEvidence: ['customer_communication', 'signed_contract', 'refund_policy'],
    optionalEvidence: ['transaction_receipt', 'delivery_proof'],
    responseStrategy: 'Show that cancellation was not accepted per your policy (e.g., item already shipped, non-cancellable service), or demonstrate that no valid cancellation request was received. Provide your cancellation policy as disclosed at time of purchase and all customer communications around the cancellation request.',
    commonMistakes: ['No clear cancellation policy', 'Missing communication records around cancellation']
  },
  {
    code: '4834',
    network: 'mastercard',
    name: 'Point of Interaction Error',
    category: 'Processing Error',
    difficulty: 'Easy',
    winRateBenchmark: 60,
    description: 'Error occurred at the point of interaction during transaction processing.',
    requiredEvidence: ['transaction_receipt', 'billing_descriptor'],
    optionalEvidence: ['avs_cvv_match'],
    responseStrategy: 'Provide complete transaction records showing the correct processing occurred. For duplicate transactions, show each represents a separate legitimate sale. For amount errors, provide the original authorized amount documentation.',
    commonMistakes: ['Missing point of sale system logs', 'Inadequate transaction documentation']
  },
  {
    code: '4837',
    network: 'mastercard',
    name: 'No Cardholder Authorization',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 28,
    description: 'Cardholder claims they did not authorize the transaction.',
    requiredEvidence: ['avs_cvv_match', 'transaction_receipt'],
    optionalEvidence: ['prior_transactions', 'customer_communication', 'delivery_proof'],
    responseStrategy: 'Provide all authorization evidence: (1) AVS and CVV match results, (2) IP address matching customer location, (3) Device fingerprint consistency, (4) Order confirmation sent to cardholder email, (5) Delivery proof to billing address. Prior transaction history with the same cardholder is particularly valuable. If 3D Secure was used, provide authentication data.',
    commonMistakes: ['No AVS/CVV documentation', 'Missing IP/device data', 'Not showing prior relationship with customer']
  },
  {
    code: '4840',
    network: 'mastercard',
    name: 'Fraudulent Processing of Transactions',
    category: 'Fraud',
    difficulty: 'Very Hard',
    winRateBenchmark: 12,
    description: 'Multiple fraudulent transactions processed. Extremely difficult to win.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['prior_transactions', 'customer_communication'],
    responseStrategy: 'This is one of the most difficult Mastercard codes to win. Provide comprehensive fraud prevention documentation showing your screening processes, all security checks performed, and evidence of customer authorization. 3D Secure authentication data is critical if available. Consider escalating to your payment processor for additional support.',
    commonMistakes: ['Insufficient fraud prevention documentation', 'No 3DS data', 'Underestimating case difficulty']
  },
  {
    code: '4853',
    network: 'mastercard',
    name: 'Cardholder Dispute',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 38,
    description: 'Cardholder disputes the goods or services received.',
    requiredEvidence: ['customer_communication', 'transaction_receipt', 'delivery_proof'],
    optionalEvidence: ['signed_contract', 'refund_policy', 'usage_logs'],
    responseStrategy: 'Address the specific dispute claim with targeted evidence. If the customer claims non-receipt, provide delivery proof. If they claim the goods were defective, provide product quality documentation or evidence of prior complaint resolution. Customer communication showing acknowledgment of receipt or satisfaction is valuable. Show your return/refund policy was properly disclosed.',
    commonMistakes: ['Not addressing specific dispute claim', 'Missing customer communication history', 'No delivery or service proof']
  },
  {
    code: '4855',
    network: 'mastercard',
    name: 'Goods or Services Not Provided',
    category: 'Consumer',
    difficulty: 'Medium',
    winRateBenchmark: 40,
    description: 'Customer did not receive goods or services as promised.',
    requiredEvidence: ['delivery_proof', 'transaction_receipt', 'customer_communication'],
    optionalEvidence: ['usage_logs', 'signed_contract'],
    responseStrategy: 'Similar to Visa 13.1, your key evidence is proof of delivery or service fulfillment. For physical goods, provide tracking and delivery confirmation. For digital goods/services, provide access logs, download records, or service activation confirmation. Include all customer communications, especially any showing the customer received or acknowledged the goods/services.',
    commonMistakes: ['No delivery confirmation', 'Missing service fulfillment records', 'Inadequate customer communication documentation']
  },
  {
    code: '4863',
    network: 'mastercard',
    name: 'Cardholder Does Not Recognize',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 32,
    description: 'Cardholder does not recognize the transaction on their statement.',
    requiredEvidence: ['billing_descriptor', 'transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['customer_communication', 'prior_transactions', 'delivery_proof'],
    responseStrategy: 'The cardholder may simply not recognize your billing descriptor. Provide: (1) Clear documentation of your billing descriptor as it appears on statements, (2) Order confirmation emails sent to the cardholder, (3) AVS/CVV match data showing card ownership, (4) Any customer communication showing interaction. If you have prior transactions from the same customer, include them. A clear billing descriptor match often resolves these disputes.',
    commonMistakes: ['Unclear billing descriptor', 'Not providing order confirmation emails', 'Missing prior transaction history']
  },
  {
    code: '4871',
    network: 'mastercard',
    name: 'Chip/PIN Liability Shift',
    category: 'Fraud',
    difficulty: 'Hard',
    winRateBenchmark: 22,
    description: 'EMV chip card used at non-EMV terminal, shifting liability to merchant.',
    requiredEvidence: ['transaction_receipt', 'avs_cvv_match'],
    optionalEvidence: ['billing_descriptor', 'customer_communication'],
    responseStrategy: 'Demonstrate that your terminal was EMV-capable and the chip was properly read. If the card was swiped instead of chipped, this is difficult to win — focus on all other supporting evidence of transaction legitimacy. Upgrade to EMV terminals to prevent future liability shift disputes.',
    commonMistakes: ['Non-EMV terminal documented', 'Missing chip transaction data', 'No terminal capability proof']
  }
];

export function getReasonCode(code: string): ReasonCode | undefined {
  return REASON_CODES.find(rc => rc.code === code);
}

export function getReasonCodesByNetwork(network: 'visa' | 'mastercard'): ReasonCode[] {
  return REASON_CODES.filter(rc => rc.network === network);
}

export function getReasonCodesByCategory(category: Category): ReasonCode[] {
  return REASON_CODES.filter(rc => rc.category === category);
}
