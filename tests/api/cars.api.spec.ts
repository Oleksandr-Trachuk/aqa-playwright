import { test, expect, APIRequestContext } from '@playwright/test';

// (email + password)
async function login(request: APIRequestContext) {
  const email = process.env.QAUTO_USER_EMAIL || '';
  const password = process.env.QAUTO_USER_PASSWORD || '';

  expect(email, 'QAUTO_USER_EMAIL must be set').not.toEqual('');
  expect(password, 'QAUTO_USER_PASSWORD must be set').not.toEqual('');

  const response = await request.post('/api/auth/signin', {
    data: { email, password },
  });

  expect(response.ok(), 'signin response not OK').toBeTruthy();

  const body = await response.json();
  expect(body.status).toBe('ok');
}

test.describe('POST /api/cars', () => {
  // 1️⃣ positive case
  test('позитивний: машина створюється з валідними даними', async ({ request }) => {
    await login(request);

    const createResponse = await request.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: 12345,
      },
    });

    expect([200, 201]).toContain(createResponse.status());

    const body = await createResponse.json();

    expect(body.status).toBe('ok');
    expect(body.data).toBeDefined();
    expect(typeof body.data.id).toBe('number');
    expect(body.data.mileage).toBe(12345);
  });

  // 2️⃣ Negative case
  test('негативний: немає обовʼязкового carModelId', async ({ request }) => {
    await login(request);

    const response = await request.post('/api/cars', {
      data: {
        carBrandId: 1,
        // carModelId 
        mileage: 5000,
      } as any,
    });

    const status = response.status();
    console.log('NEGATIVE NO MODEL STATUS:', status);

    // not ok
    expect(response.ok()).toBeFalsy();
    expect(status).toBeGreaterThanOrEqual(400);

    let body: any = {};
    try {
      body = await response.json();
    } catch {
    }

    if (body && typeof body === 'object') {
      if ('status' in body) {
        expect(body.status).not.toBe('ok');
      }
      if ('message' in body) {
        expect(String(body.message).length).toBeGreaterThan(0);
      }
    }
  });

  // 3️⃣ negative scenario
  test('негативний: невалідний пробіг (validation error)', async ({ request }) => {
    await login(request);

    const response = await request.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: -50,
      },
    });

    const status = response.status();
    console.log('NEGATIVE MILEAGE STATUS:', status);

    //not ok
    expect(status).toBeGreaterThanOrEqual(400);

    let body: any = {};
    try {
      body = await response.json();
    } catch {

    }

    if (body && typeof body === 'object') {
      if ('status' in body) {
        expect(body.status).not.toBe('ok');
      }
      if ('message' in body) {
        expect(String(body.message).length).toBeGreaterThan(0);
      }
    }
  });
});