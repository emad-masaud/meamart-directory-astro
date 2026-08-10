---
title: Chatbot Scenario for Cross-Section Linking
description: Scenario and workflows for chatbot linking Food, Venues, and Delivery in MeaMart
---

# Chatbot Workflow for Linking Food, Venues, and Delivery

This document outlines how conversation scenarios in the chatbot link the three sections (Food, Venues, and Delivery) to build an integrated user experience.

## Scenario 1: Ordering Food to an External Location (Farm, Resthouse, Camp)

### 1. Identify User Intent and Location
- The user requests food while staying at a rented venue (e.g., "I'm at Yasmin Farm and want to order dinner").
- The bot searches the Venues & Places section (`places-venues`) for "Yasmin Farm" to retrieve its data.

### 2. Verify Venue Terms and Location
- The bot retrieves the following fields for the venue:
  - Detailed address (`detailed_address`)
  - Geolocation link (`map_link`)
  - Food delivery allowed (`food_delivery_allowed`)
  - Delivery instructions for the driver (`delivery_instructions`)
  - Keeper contact (`keeper_contact`)
- If delivery is not allowed, the bot informs the user immediately.
- If allowed, it proceeds to the next step.

### 3. Recommend Kitchens and Restaurants
- The bot searches the Food & Home Kitchens section (`food-home-kitchens`) for restaurants that cover the farm's region:
  - Target field: `delivers_to_places = true`
  - Target field: `delivery_areas`
- The bot displays the list of available restaurants for the user.
