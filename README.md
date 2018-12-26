DISCLAIMER
==========

- You should understand what you are doing. This software is not intended as turn-key, reliable solution. You should engineer your own solution, which may wind up being better, safer, and more reliable than mine.
- Proceed at your own risk. You've been warned. If you break your bot, burn your house down, or injure yourself or others, I take no responsibility.

This software is provided by the author "as is" and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the author be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.


DESCRIPTION
===========
This is an experimental replacement for the FlashAir user interface.  I use on my v2 card.  There is a minor difference in how the javascript list is generated between the v1 and v2 cards; I'm not if it’ll work with a v1 card, but it should.  The sample code from FlashAir-Developers.com includes code to handle the difference between card versions.

This replacement UI for the FlashAir gives you a few more features on the web interface:

1.  Delete files from file list
2.  File upload progress
3.  Verify file size of upload to insure that it matches what’s on the FlashAir.  (not a full diff like I do with the python script, due to javascript limitations)
4.  Drag and drop on browser window to upload.

INSTALLATION
============

1. Back up your SD_WLAN directory. (Just in case)
2. Unzip this somewhere, and copy the out of the List.html file  to your card's SD_WLAN folder.  (Do not copy the entire SD_WLAN folder from this ZIP file to your card, as you might trash your config files etc.)
3. Copy the SD_WLAN/js folder to your card's SD_WLAN folder.
3. Remount the card, the new web interface should load now when you go to the http interface.

CHANGELOG
=========

v0.1 - Initial release
v0.2 - Fix for v1 cards contributed by Jared Wellman
v0.3 - (marciot@yahoo.com) Changes by to improve look of interface, also convert to 8.3 file names when needed it.
