import * as winston from 'winston';

// Recreate the console format to validate expected behavior from logger.config.ts
// Rules:
// - Layout: `${timestamp} [traceId?] [context||'App'] level: message meta?` + optional `\ntrace`
// - Level: lowercased with trailing colon, except warn -> 'warning:'
// - Meta: exclude service and version keys from console output
import { buildConsoleFormat, loggerConfig } from '../../../../src/shared/logger/logger.config';
const consoleFormat = winston.format.printf(({ level, message, timestamp, context, trace, traceId, ...meta }) => {
	let log = `${timestamp}`;

	if (traceId) {
		log += ` [${traceId}]`;
	}

	log += ` [${context || 'App'}]`;

	const formattedLevel = level === 'warn' ? 'warning:' : `${String(level).toLowerCase()}:`;
	log += ` ${formattedLevel}`;

	log += ` ${message}`;

	const relevantMeta = Object.keys(meta).reduce((acc: Record<string, unknown>, key) => {
		if (!['service', 'version'].includes(key)) {
			acc[key] = (meta as any)[key];
		}
		return acc;
	}, {} as Record<string, unknown>);

	if (Object.keys(relevantMeta).length > 0) {
		log += ` ${JSON.stringify(relevantMeta)}`;
	}

	if (trace) {
		log += `\n${trace}`;
	}

	return log;
});

describe('console format (logger.config.ts)', () => {
	it('formats warn level with default context, excludes service/version, includes traceId and meta', () => {
		const input = {
			level: 'warn',
			message: 'Please check',
			timestamp: '2025-08-30 12:34:56.789',
			// no explicit context -> falls back to 'App'
			traceId: 'abc-123',
			service: 'aprove-me-api',
			version: '1.5.0',
			userId: 42,
			[Symbol.for('message')]: ''
		} as any;

		const out = consoleFormat.transform(input, {}) as any;
		const msg = out[Symbol.for('message')];

		expect(msg).toBe('2025-08-30 12:34:56.789 [abc-123] [App] warning: Please check {"userId":42}');
		expect(msg).not.toContain('service');
		expect(msg).not.toContain('version');
	});

	it('adds trace on a new line when present and respects provided context', () => {
		const input = {
			level: 'ERROR',
			message: 'Boom',
			timestamp: '2025-08-30 12:34:56.789',
			context: 'Auth',
			trace: 'Error: Boom\n    at x.ts:1:1',
			[Symbol.for('message')]: ''
		} as any;

		const out = consoleFormat.transform(input, {}) as any;
		const msg = out[Symbol.for('message')];

		// level should be lowercased with colon
		expect(msg).toContain('[Auth] error: Boom');
		expect(msg).toContain('\nError: Boom');
	});
});

	// Integração: usar o format configurado no transport Console do loggerConfig
	describe('logger.config Console transport format (integração real)', () => {
		// helper para remover códigos ANSI de cor
		const stripAnsi = (s: string) => s.replace(/[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

		// Para evitar acoplamento com colorize, usamos diretamente o builder exportado
		const fmt = buildConsoleFormat();

		it('formata warn como "warning:" e oculta service/version', () => {
			const info: any = {
				level: 'warn',
				message: 'Check me',
				// timestamp será injetado pelo format.timestamp, mas podemos passar um para estabilizar
				timestamp: '2025-08-30 12:00:00.000',
				traceId: 'tid-1',
				// meta irrelevante que deve ser removida do console
				service: 'aprove-me-api',
				version: '1.5.0',
				extra: 1,
			};
			const out = fmt.transform(info, {} as any) as any;
			const msg = stripAnsi(out[Symbol.for('message')]);
			expect(msg).toContain('[tid-1] [App] warning: Check me');
			expect(msg).toContain('{"extra":1}');
			expect(msg).not.toContain('service');
			expect(msg).not.toContain('version');
		});

		it('inclui context quando fornecido e anexa trace em nova linha', () => {
			const info: any = {
				level: 'ERROR',
				message: 'Boom',
				timestamp: '2025-08-30 12:00:00.000',
				context: 'Auth',
				trace: 'Error: Boom\n    at x.ts:1:1',
			};
			const out = fmt.transform(info, {} as any) as any;
			const msg = stripAnsi(out[Symbol.for('message')]);
			expect(msg).toContain('[Auth] error: Boom');
			expect(msg).toContain('\nError: Boom');
		});
	});

