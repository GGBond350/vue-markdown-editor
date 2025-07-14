<template>
    <div class="footer">
			<p class="footer-text">© 2025 ZJY. All rights reserved.</p>
    	<p class="footer-text">Made with ❤️ in Vue 3</p>
   	 <p class="footer-quote">“文字让思想流动”</p>
    </div>
</template>

<script lang="ts" setup></script>


<style scoped> 
.footer {
  text-align: center;
  font-size: 0.875rem; /* text-sm */
  color: #6b7280; /* text-gray-500 */
  padding: 1rem 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e5e7eb; /* border-gray-200 */
  transition: background-color 0.3s, color 0.3s;
}
.footer-text {
  margin: 0.25rem 0;
}

.footer-quote {
  margin-top: 0.5rem;
  font-style: italic;
  color:  #9ca3af; /* text-gray-400 */
}
</style>