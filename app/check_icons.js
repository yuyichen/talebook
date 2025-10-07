// 检查 @vicons/ionicons5 中的图标
import * as icons from '@vicons/ionicons5';

// 列出所有可用的图标
console.log('Available icons in @vicons/ionicons5:');
console.log(Object.keys(icons));

// 检查我们使用的图标是否存在
const usedIcons = [
  'Download',
  'ThumbUp',
  'Share',
  'Email',
  'ImportContacts',
  'MoreVertical',
  'Checkmark',
  'ArrowForward',
  'Person',
  'Group',
  'Explore',
  'Bookmark'
];

console.log('\nChecking used icons:');
usedIcons.forEach(icon => {
  console.log(`${icon}: ${icon in icons ? '✓ Available' : '✗ Not available'}`);
});
