

export namespace GQLFragments {
	export const FullEmote = (includeActivity = false) => `
		fragment fullEmote on Emote {
			id,
			created_at,
			name,
			channels {
				id, login, display_name, role {
					name, color, allowed, denied, position
				}, profile_image_url
			},
			owner {
				id,
				display_name, created_at, profile_image_url,
				role {
					id, name, color, allowed, denied, position
				}
			},
			visibility,
			mime,
			status,
			tags,
			${includeActivity ? 'audit_entries' : ''}
		}
	`;

	export const FullUser = (includeFullEmotes = false, includeOwnedEmotes = false) => `
		fragment FullUser on User {
			id,  email, display_name, login,
			rank,
			role {
				id,
				name,
				position,
				color,
				allowed,
				denied
			},
			${includeFullEmotes
				? 'emotes { ...FullEmote },'
				: ''
			}
			${includeOwnedEmotes
				? 'owned_emotes { id, name, status, visibility },'
				: ''
			}
			emote_ids,
			editor_ids,
			twitch_id,
			broadcaster_type,
			profile_image_url,
			created_at
		}

		${includeFullEmotes ? FullEmote() : ''}
	`;
}

