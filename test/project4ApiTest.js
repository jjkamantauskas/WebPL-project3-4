/* global describe, it, before */
/**
 * Tests for Project 4 new endpoints:
 *   POST /photos
 *   POST /photos/:photoId/like
 *
 * Run from the test/ directory:
 *   npm test
 */

import assert from 'assert';
import http from 'http';

const port = 3001;
const host = 'localhost';

/** Helper to make HTTP requests with JSON body */
function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

describe('Project 4: New Endpoint Tests', function () {
  let authCookie;
  let currentUserId;

  // Login before running tests
  before(function (done) {
    const postBody = JSON.stringify({ login_name: 'took', password: 'password' });
    const options = {
      hostname: host,
      port,
      path: '/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postBody.length,
      },
    };

    makeRequest(options, postBody).then((res) => {
      assert.strictEqual(res.status, 200, 'Login should succeed');
      authCookie = res.headers['set-cookie'] && res.headers['set-cookie'][0];
      currentUserId = res.body._id;
      done();
    }).catch(done);
  });

  // ── POST /photos ────────────────────────────────────────────────────────────
  describe('POST /photos', function () {
    it('returns 401 when not authenticated', function (done) {
      const postBody = JSON.stringify({ url: 'https://res.cloudinary.com/test/image/upload/test.jpg' });
      const options = {
        hostname: host,
        port,
        path: '/photos',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postBody.length,
          // No cookie — unauthenticated
        },
      };

      makeRequest(options, postBody).then((res) => {
        assert.strictEqual(res.status, 401, 'Should return 401 when not logged in');
        done();
      }).catch(done);
    });

    it('returns 400 when URL is missing', function (done) {
      const postBody = JSON.stringify({});
      const options = {
        hostname: host,
        port,
        path: '/photos',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postBody.length,
          Cookie: authCookie,
        },
      };

      makeRequest(options, postBody).then((res) => {
        assert.strictEqual(res.status, 400, 'Should return 400 when URL is missing');
        done();
      }).catch(done);
    });

    it('returns 400 when URL is empty string', function (done) {
      const postBody = JSON.stringify({ url: '   ' });
      const options = {
        hostname: host,
        port,
        path: '/photos',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postBody.length,
          Cookie: authCookie,
        },
      };

      makeRequest(options, postBody).then((res) => {
        assert.strictEqual(res.status, 400, 'Should return 400 when URL is empty');
        done();
      }).catch(done);
    });

    let createdPhotoId;

    it('saves the photo URL and returns 201 when authenticated', function (done) {
      const testUrl = 'https://res.cloudinary.com/test/image/upload/v1/test-photo.jpg';
      const postBody = JSON.stringify({ url: testUrl });
      const options = {
        hostname: host,
        port,
        path: '/photos',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postBody.length,
          Cookie: authCookie,
        },
      };

      makeRequest(options, postBody).then((res) => {
        assert.strictEqual(res.status, 201, 'Should return 201 on success');
        assert.strictEqual(res.body.file_name, testUrl, 'file_name should match the submitted URL');
        assert(res.body._id, 'Should return the new photo with an _id');
        assert.strictEqual(res.body.user_id, currentUserId, 'user_id should match logged-in user');
        createdPhotoId = res.body._id;
        done();
      }).catch(done);
    });

    // ── POST /photos/:photoId/like ────────────────────────────────────────────
    describe('POST /photos/:photoId/like', function () {
      it('returns 401 when not authenticated', function (done) {
        const options = {
          hostname: host,
          port,
          path: `/photos/${createdPhotoId}/like`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            // No cookie — unauthenticated
          },
        };

        makeRequest(options, '').then((res) => {
          assert.strictEqual(res.status, 401, 'Should return 401 when not logged in');
          done();
        }).catch(done);
      });

      it('adds a like when the user has not yet liked the photo', function (done) {
        const options = {
          hostname: host,
          port,
          path: `/photos/${createdPhotoId}/like`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            Cookie: authCookie,
          },
        };

        makeRequest(options, '').then((res) => {
          assert.strictEqual(res.status, 200, 'Should return 200 on success');
          assert(Array.isArray(res.body.likes), 'likes should be an array');
          assert.strictEqual(res.body.likes.length, 1, 'Should have 1 like after liking');
          done();
        }).catch(done);
      });

      it('removes the like when the same user likes again (toggle)', function (done) {
        const options = {
          hostname: host,
          port,
          path: `/photos/${createdPhotoId}/like`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            Cookie: authCookie,
          },
        };

        makeRequest(options, '').then((res) => {
          assert.strictEqual(res.status, 200, 'Should return 200 on success');
          assert.strictEqual(res.body.likes.length, 0, 'Should have 0 likes after unliking');
          done();
        }).catch(done);
      });

      it('returns 404 for a non-existent photo id', function (done) {
        const fakeId = '000000000000000000000000';
        const options = {
          hostname: host,
          port,
          path: `/photos/${fakeId}/like`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            Cookie: authCookie,
          },
        };

        makeRequest(options, '').then((res) => {
          assert.strictEqual(res.status, 404, 'Should return 404 for non-existent photo');
          done();
        }).catch(done);
      });
    });
  });
});
