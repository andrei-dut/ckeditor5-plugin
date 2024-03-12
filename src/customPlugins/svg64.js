// prettier-ignore
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const PREFIX = 'data:image/svg+xml;base64,';

export const utf8Encode = (input) => {
	input = input.replace(/\r\n/g, '\n');

	let i = 0;
	let output = '';

	for (; i < input.length; i++) {
		const c = input.charCodeAt(i);

		if (c < 128) {
			output += String.fromCharCode(c);
		} else if (c > 127 && c < 2048) {
			output += String.fromCharCode((c >> 6) | 192);
			output += String.fromCharCode((c & 63) | 128);
		} else {
			output += String.fromCharCode((c >> 12) | 224);
			output += String.fromCharCode(((c >> 6) & 63) | 128);
			output += String.fromCharCode((c & 63) | 128);
		}
	}

	return output;
};

export const encode = (input) => {
	let i = 0;
	let chr1;
	let chr2;
	let chr3;
	let enc1;
	let enc2;
	let enc3;
	let enc4;
	let output = '';

	input = utf8Encode(input);

	while (i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output + CHARS.charAt(enc1) + CHARS.charAt(enc2) + CHARS.charAt(enc3) + CHARS.charAt(enc4);
	}

	return output;
};

export const detectInputType = (input) => {
	if (typeof input === 'string') {
		return 'string';
	}

	if (typeof SVGElement !== 'undefined' && input instanceof SVGElement) {
		return 'element';
	}
};

export const getBase64 = (input) => PREFIX + encode(input);

export const convertElement = (input) => getBase64(new XMLSerializer().serializeToString(input));

export const svg64 = (input) => {
	const type = detectInputType(input);

	switch (type) {
		case 'string':
			return getBase64(input);

		case 'element':
			return convertElement(input);

		default:
			return input;
	}
};

export default svg64
