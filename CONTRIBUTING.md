# Contributing

Like most open source projects, we ask that you fork the project and issue a [pull request](#pull-requests) with your changes.

We encourage small change pull requests, the smaller the change the quicker and easier it is merged.

## Dependencies

To build the buttons locally, you'll need to install:
 * [node.js](http://nodejs.org),
 * [Gulp](http://gulpjs.com),

## Workflow

1. Fork the project
2. Clone down your fork
`git clone git://github.com/<username>/buttons.git`
3. Setup your 'upstream'
`git remote add upstream https://github.com/skyglobal/buttons.git`
4. Create a topic branch to contain your change
`git checkout -b feature-my-feature`
5. Write tests, write your code!
6. Make sure [CHANGELOG.md](./CHANGELOG.md) includes a summary of your changes in a new version number heading
5. Make sure you are still up to date with master
`git pull upstream master`
6. If necessary, rebase your commits into logical chunks, without errors.
7. Push the branch up 
`git push origin feature-my-feature`
8. Create a pull request and describe what your change does and the why you think it should be merged.

If you would like the feature to go live sooner, mention this in the comments/commit. We will provide a temporary live url that will allow you to carry on without getting blocked.

## Running Locally

 * `gulp serve` :  Build project + run server
 
## Releasing (admin only)

 * Update [package.json](package.json) version number appropriately
 * `gulp release:bower` : release the code to bower
 * `gulp release:gh-pages` : push the latest version to gh-pages
 * `gulp release:cdn` : push the latest version to Akamai

## Common Errors

**`S3::putObject *** error!`** or **`UnknownEndpoint: Inaccessible host: `**

This happens whn a connection to the S3 failed to establish. `bump` and `gh-pages` would have already executed.  Please try the release to cloud only by running:

`component release cloud`
