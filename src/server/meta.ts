import { Router } from 'express';
import { get, post } from 'superagent';
import { environment } from 'src/environments/environment';
import { DataStructure } from '@typings/typings/DataStructure';
import { BitField } from '@typings/src/BitField';


const apiBase = environment.platformApiUrl('v2');

export function generateMetaTags(server: Router): void {
	server.get('/services/oembed', (req, res) => {
		let data = req.query.object as string;
		try {
			data = JSON.parse(Buffer.from(data as string, 'base64').toString('utf8'));
		} catch (err) {
			console.error('oembed object parse error,', err);
			return res.status(400).send(err.message);
		}

		console.log('Generate OEmbed:', data);
		return res.contentType('application/json').status(200).send(data);
	});

	server.use((req, res, next) => {
		const uri = req.url.split(/[?#]/)[0];
		const params = req.url.split('/').slice(1);

		// Is Emote Page?
		if (new RegExp('(\/emotes\/)([a-z0-9]){24}').test(uri)) {
			const emoteID = params[1].split(/[?#]/)[0] ?? '';
			if (emoteID.length === 0) {
				return next();
			}

			post(`${apiBase}/gql`).set('Content-Type', 'application/json').send({
				query: `
					query GetEmote($id: String!) {
						emote(id: $id) {
							id name channel_count visibility provider urls owner { display_name }
						}
					}
				`,
				variables: { id: emoteID.trim() }
			}).then(resp => {
				const body = resp.body.data.emote as DataStructure.Emote;
				res.locals.tags = createOEmbedTagEmote(body);

				next();
			}).catch(err => {
				console.log(err);
				return next();
			});
		} else if (new RegExp('(\/users\/)([a-z0-9]){24}').test(uri)) {
			const userID = params[1].split(/[?#]/)[0] ?? '';
			if (userID.length === 0) {
				return next();
			}


			post(`${apiBase}/gql`).set('Content-Type', 'application/json').send({
				query: `
					query GetUser($id: String!) {
						user(id: $id) {
							id display_name profile_image_url emote_slots emotes { id } role { name color }
						}
					}
				`,
				variables: { id: userID.trim() }
			}).then(resp => {
				const body = resp.body.data.user as DataStructure.TwitchUser;
				res.locals.tags = `
					${createOEmbedTagUser(body)}
				`;

				next();
			}).catch(err => {
				console.log(err);
				return next();
			});
		} else {
			next();
		}
	});
}

function createOEmbedTagEmote(emote: DataStructure.Emote): string {
	const data = Buffer.from(JSON.stringify({
		author_name: ''.concat(
			`${emote?.name} by ${emote?.owner?.display_name ?? 'Unknown User'} `,
			`${BitField.HasBits(emote?.visibility ?? 0, DataStructure.Emote.Visibility.GLOBAL) ? '(Global Emote)' : `(${emote.channel_count ?? 0} Channels)`}`
		),
		author_url: `https://${environment.origin}/emotes/${emote.id}`,
		provider_name: `7TV.APP - It's like a third party thing`,
		provider_url: 'https://7tv.app',
		type: 'photo',
		url: emote.urls?.[3][1]
	})).toString('base64');

	return `
		<meta name="og:description" content="uploaded by ${emote.owner?.display_name}">
		<meta name="og:image" content="${emote.urls?.[3][1]}">
		<meta name="og:image:type" content="image/webp">
		<meta name="theme-color" content="#0288D1">
		<link type="application/json+oembed" href="https://${environment.origin}/services/oembed?object=${data.toString()}">
	`;
}

function createOEmbedTagUser(user: DataStructure.TwitchUser): string {
	const data = Buffer.from(JSON.stringify({
		title: '7TV',
		author_name: user.display_name,
		author_url: `https://${environment.origin}/users/${user.id}`,
		provider_name: `7TV.APP - It's like a third party thing`,
		provider_url: 'https://7tv.app'
	})).toString('base64');

	const roleColor = user.role?.color ? `#${user.role.color.toString(16)}` : '#fff';
	return `
		<meta name="og:description" content="${user.display_name} is${!!user.role?.name ? ` ${user.role.name}` : ''} on 7TV with ${user.emotes.length}/${user.emote_slots} emotes enabled">
		<meta name="og:image" content="${user.profile_image_url}">
		<meta name="og:image:type" content="image/png">
		<meta name="theme-color" content="${roleColor}">
		<link type="application/json+oembed" href="https://${environment.origin}/services/oembed?object=${data.toString()}">
	`;
}
