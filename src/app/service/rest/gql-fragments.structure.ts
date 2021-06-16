

export namespace GQLFragments {
	export const FullEmote = (includeActivity = false) => `
		fragment FullEmote on Emote {
			id,
			created_at,
			name,
			width, height,
			channels {
				id, login, display_name, role {
					id, name, color, allowed, denied, position
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

	export const ShorthandPartialUser = () => `
		id, display_name, login,
		role { id, name, position, color, allowed, denied },
		profile_image_url,
		emote_ids
	`;

	export const ShortHandRole = () => `
		role {
			id, name, color, allowed, denied, position
		}
	`;

	export const FullUser = (
		includeFullEmotes = false,
		includeOwnedEmotes = false,
		includeEditors = false,
		includeEditorIn = false,
		includeAuditEntries = false
	) => `
		fragment FullUser on User {
			id,  email, display_name, login,
			description,
			role {
				id,
				name,
				position,
				color,
				allowed,
				denied
			},
			emote_aliases,
			${includeFullEmotes
				? 'emotes { id, name, status, visibility, width, height },'
				: ''
			}
			${includeOwnedEmotes
				? 'owned_emotes { id, name, status, visibility, width, height },'
				: ''
			}
			emote_ids,
			editor_ids,
			${includeEditors
				? `editors { ${ShorthandPartialUser()} },`
				: ''
			}
			${includeEditorIn
				? `editor_in { ${ShorthandPartialUser()} },`
				: ''
			}
			twitch_id,
			broadcaster_type,
			profile_image_url,
			created_at,
			${includeAuditEntries ?
			`
				audit_entries {
					id,
					type,
					timestamp,
					action_user_id,
					action_user {
						${ShorthandPartialUser()}
					},
					changes {
						key, values
					},
					target {
						type,
						data,
						id
					}
				}
			` : ''
			}
		}
	`;
}

