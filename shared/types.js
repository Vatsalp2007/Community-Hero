/**
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string} displayName
 * @property {string} email
 * @property {string|null} photoURL
 * @property {"citizen"|"moderator"|"officer"|"admin"} role
 * @property {string} city
 * @property {string} ward
 * @property {number} civicScore
 * @property {"bronze"|"silver"|"gold"|"platinum"|"hero"} level
 * @property {string[]} badgeIds
 * @property {number} totalReports
 * @property {number} totalResolved
 * @property {any} createdAt
 * @property {string|null} fcmToken
 * @property {boolean} notificationsEnabled
 */

/**
 * @typedef {Object} Issue
 * @property {string} issueId
 * @property {string} reportedBy
 * @property {string} reporterName
 * @property {string} reporterPhoto
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {number} severity
 * @property {string} status
 * @property {string} department
 * @property {any} location
 * @property {string} address
 * @property {string} ward
 * @property {string} city
 * @property {string[]} mediaUrls
 * @property {string} thumbnailUrl
 * @property {any} aiClassification
 * @property {number} upvotes
 * @property {string[]} upvotedBy
 * @property {string[]} verifiedBy
 * @property {boolean} isVerified
 * @property {string|null} duplicateOf
 * @property {string} assignedDept
 * @property {any} assignedAt
 * @property {any} resolvedAt
 * @property {string|null} resolvedBy
 * @property {string|null} resolutionNote
 * @property {string|null} resolutionPhotoUrl
 * @property {string|null} rejectionReason
 * @property {any} createdAt
 * @property {any} updatedAt
 * @property {string} geohash
 * @property {string} trackingId
 */
