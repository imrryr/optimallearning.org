#!/usr/bin/env bash
set -euo pipefail

artifact=${1:?Pass the verified build directory}
bucket=optimallearning.org
distribution=E1TXXZFADCMIJE
region=us-east-1

node tools/wiki-publisher/verify.mjs "$artifact"
test -s "$artifact/wiki/publication.json"
versioning=$(aws s3api get-bucket-versioning --bucket "$bucket" --region "$region" --query Status --output text)
if [ "$versioning" != Enabled ]; then
  echo 'Bucket versioning must be enabled before automated replacement/removal of generated pages.' >&2
  exit 1
fi

# Only this generated prefix can be pruned. Object versions remain recoverable.
# Publish the revision marker last, after all content and metadata have succeeded.
aws s3 sync "$artifact/wiki/" "s3://$bucket/wiki/" --region "$region" --delete --exclude publication.json --cache-control 'public,max-age=300' --only-show-errors
for file in sitemap.xml robots.txt links.html _frame/site-refresh.css _frame/favicon-network.svg; do
  aws s3 cp "$artifact/$file" "s3://$bucket/$file" --region "$region" --cache-control 'public,max-age=300' --only-show-errors
done
aws s3 cp "$artifact/wiki/publication.json" "s3://$bucket/wiki/publication.json" --region "$region" --content-type application/json --cache-control 'no-cache,max-age=0' --only-show-errors
invalidation=$(aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/wiki/*' '/sitemap.xml' '/robots.txt' '/links.html' '/_frame/site-refresh.css' '/_frame/favicon-network.svg*' --query Invalidation.Id --output text)
aws cloudfront wait invalidation-completed --distribution-id "$distribution" --id "$invalidation"
echo "Published wiki and refreshed CloudFront ($invalidation)."
