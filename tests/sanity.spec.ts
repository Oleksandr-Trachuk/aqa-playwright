import { test, expect } from '@playwright/test';
import 'dotenv/config';

const BASE = process.env.BASE_URL ?? 'https://qauto.forstudy.space';
const EMAIL = process.env.QAUTO_EMAIL ?? 'lanifel629@foxroids.com';
const PASS  = process.env.QAUTO_PASSWORD ?? '1q2w3e4r5T';

test('GET /api/cars returns ok (with fallback signin)', async ({ page }) => {
  
  await page.goto(new URL('/', BASE).toString());

  const apiGetCars = async () => {
    return await page.evaluate(async () => {
      const res = await fetch('/api/cars', {
        credentials: 'include',
        headers: { accept: 'application/json' }
      });
      let json: any = null;
      try { json = await res.json(); } catch (_) {}
      return { ok: res.ok, status: res.status, json };
    });
  };

  const apiSignin = async (email: string, password: string) => {
    return await page.evaluate(async (creds) => {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({ email: creds.email, password: creds.password, remember: false })
      });
      let json: any = null;
      try { json = await res.json(); } catch (_) {}
      return { ok: res.ok, status: res.status, json };
    }, { email, password });
  };
  let r = await apiGetCars();
  if (r.status === 401) {
    const signin = await apiSignin(EMAIL, PASS);
    if (!signin.ok) {
      throw new Error(`Signin failed in test: ${signin.status} ${JSON.stringify(signin.json)}`);
    }
    r = await apiGetCars();
  }


  console.log('GET /api/cars →', r.status, r.json);
  expect(r.ok, `GET /api/cars status=${r.status} body=${JSON.stringify(r.json)}`).toBeTruthy();
  expect((r.json?.status ?? 'ok')).toBe('ok');
});

test('Garage UI opens', async ({ page }) => {
  await page.goto(new URL('/panel/garage', BASE).toString());
  await expect(page).toHaveURL(/\/panel\/garage/);
});