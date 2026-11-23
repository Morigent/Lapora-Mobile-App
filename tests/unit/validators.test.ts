import {
  firstError,
  validateDescription,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/utils/validators';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('   ')).toBe('Email wajib diisi');
  });

  it('accepts ordinary addresses', () => {
    expect(validateEmail('rani@example.com')).toBeNull();
    expect(validateEmail('  rani.w@mail.co.id ')).toBeNull();
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('rani@example')).toBe('Format email belum benar');
    expect(validateEmail('rani example.com')).toBe('Format email belum benar');
    expect(validateEmail('rani@.com')).toBe('Format email belum benar');
  });
});

describe('validatePassword', () => {
  it('requires at least eight characters', () => {
    expect(validatePassword('')).toBe('Kata sandi wajib diisi');
    expect(validatePassword('1234567')).toBe('Minimal 8 karakter');
    expect(validatePassword('12345678')).toBeNull();
  });
});

describe('validatePhone', () => {
  it('accepts the three Indonesian prefixes', () => {
    expect(validatePhone('081234567890')).toBeNull();
    expect(validatePhone('+6281234567890')).toBeNull();
    expect(validatePhone('6281234567890')).toBeNull();
  });

  it('tolerates spaces and dashes typed by the user', () => {
    expect(validatePhone('0812-3456-7890')).toBeNull();
    expect(validatePhone('0812 3456 7890')).toBeNull();
  });

  it('rejects landlines, short numbers, and empty input', () => {
    expect(validatePhone('')).toBe('Nomor telepon wajib diisi');
    expect(validatePhone('0812')).toBe('Nomor belum lengkap');
    expect(validatePhone('0274123456')).toBe('Nomor belum lengkap');
    expect(validatePhone('+628123456789012345')).toBe('Nomor belum lengkap');
  });
});

describe('validateName', () => {
  it('needs three characters after trimming', () => {
    expect(validateName('  ')).toBe('Nama wajib diisi');
    expect(validateName(' Ra ')).toBe('Nama terlalu pendek');
    expect(validateName('Rani')).toBeNull();
  });
});

describe('validateDescription', () => {
  it('enforces the 20–240 character window', () => {
    expect(validateDescription('')).toBe('Deskripsi wajib diisi');
    expect(validateDescription('Lubang kecil')).toBe('Tulis minimal 20 karakter');
    expect(validateDescription('Lubang cukup dalam di tengah jalan.')).toBeNull();
    expect(validateDescription('a'.repeat(241))).toBe('Maksimal 240 karakter');
  });

  it('ignores surrounding whitespace when counting', () => {
    expect(validateDescription(`   ${'a'.repeat(20)}   `)).toBeNull();
  });
});

describe('firstError', () => {
  it('returns the first non-null message in field order', () => {
    expect(firstError({ email: null, phone: 'Nomor belum lengkap', name: 'Nama terlalu pendek' })).toBe(
      'Nomor belum lengkap',
    );
    expect(firstError({ email: null, phone: null })).toBeNull();
  });
});
