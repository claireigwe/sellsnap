function getFlwSecretKey(): string {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) {
    throw new Error('Missing FLW_SECRET_KEY environment variable. Set it in .env.local');
  }
  return key;
}

type PaymentRequest = {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
  };
  customizations: {
    title: string;
    logo: string;
  };
};

export async function generatePaymentLink(payload: PaymentRequest) {
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getFlwSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to generate payment link');
  }

  return data.data.link;
}

export async function verifyTransaction(transactionId: string) {
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getFlwSecretKey()}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok || data.status !== 'success') {
    throw new Error('Verification failed');
  }

  return data.data;
}
