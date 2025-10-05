import os
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="PawfectMatch AI Service",
    description="AI-powered pet matching and recommendation system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PetProfile(BaseModel):
    id: str
    species: str
    breed: str
    age: int
    size: str
    personality_tags: List[str]
    intent: str
    location: Optional[Dict[str, Any]] = None
    owner_id: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    preferences: Dict[str, Any]
    location: Dict[str, Any]
    pets: List[PetProfile]

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    candidate_pets: List[PetProfile]

class RecommendationResponse(BaseModel):
    petId: str
    score: float
    reasons: List[str]

class CompatibilityRequest(BaseModel):
    pet1: PetProfile
    pet2: PetProfile

class BreedInfoRequest(BaseModel):
    breed: str
    species: str

# Pet characteristics database (simplified for demo)
BREED_CHARACTERISTICS = {
    "dog": {
        "golden retriever": {
            "temperament": ["friendly", "energetic", "good-with-kids"],
            "energy_level": "high",
            "grooming_needs": "medium",
            "size_category": "large"
        },
        "french bulldog": {
            "temperament": ["friendly", "calm", "good-with-kids"],
            "energy_level": "low",
            "grooming_needs": "low",
            "size_category": "small"
        },
        "german shepherd": {
            "temperament": ["protective", "intelligent", "trainable"],
            "energy_level": "high",
            "grooming_needs": "high",
            "size_category": "large"
        },
        "labrador retriever": {
            "temperament": ["friendly", "energetic", "good-with-kids", "good-with-pets"],
            "energy_level": "high",
            "grooming_needs": "medium",
            "size_category": "large"
        }
    },
    "cat": {
        "siamese": {
            "temperament": ["vocal", "social", "intelligent"],
            "energy_level": "medium",
            "grooming_needs": "low",
            "size_category": "medium"
        },
        "persian": {
            "temperament": ["calm", "gentle", "quiet"],
            "energy_level": "low",
            "grooming_needs": "high",
            "size_category": "medium"
        },
        "maine coon": {
            "temperament": ["friendly", "gentle", "good-with-kids"],
            "energy_level": "medium",
            "grooming_needs": "high",
            "size_category": "large"
        }
    }
}

# Personality compatibility matrix
PERSONALITY_COMPATIBILITY = {
    "friendly": ["friendly", "social", "playful"],
    "energetic": ["energetic", "playful", "active"],
    "calm": ["calm", "gentle", "quiet"],
    "playful": ["playful", "friendly", "energetic"],
    "shy": ["calm", "gentle", "quiet"],
    "protective": ["calm", "trained", "intelligent"],
    "good-with-kids": ["friendly", "gentle", "calm"],
    "good-with-pets": ["friendly", "social", "calm"],
    "trained": ["intelligent", "calm", "protective"]
}

# Size compatibility for safe interactions
SIZE_COMPATIBILITY = {
    "tiny": ["tiny", "small"],
    "small": ["tiny", "small", "medium"],
    "medium": ["small", "medium", "large"],
    "large": ["medium", "large", "extra-large"],
    "extra-large": ["large", "extra-large"]
}

class PetMatchingAI:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.scaler = StandardScaler()
        
    def calculate_breed_similarity(self, breed1: str, breed2: str, species: str) -> float:
        """Calculate similarity between two breeds based on characteristics"""
        breed1_clean = breed1.lower().strip()
        breed2_clean = breed2.lower().strip()
        
        if breed1_clean == breed2_clean:
            return 1.0
            
        breed1_chars = BREED_CHARACTERISTICS.get(species, {}).get(breed1_clean, {})
        breed2_chars = BREED_CHARACTERISTICS.get(species, {}).get(breed2_clean, {})
        
        if not breed1_chars or not breed2_chars:
            return 0.3  # Default similarity for unknown breeds
            
        # Compare temperaments
        temp1 = set(breed1_chars.get("temperament", []))
        temp2 = set(breed2_chars.get("temperament", []))
        
        if temp1 and temp2:
            temperament_similarity = len(temp1.intersection(temp2)) / len(temp1.union(temp2))
        else:
            temperament_similarity = 0.0
            
        # Compare energy levels
        energy1 = breed1_chars.get("energy_level", "medium")
        energy2 = breed2_chars.get("energy_level", "medium")
        energy_similarity = 1.0 if energy1 == energy2 else 0.5
        
        return (temperament_similarity * 0.7) + (energy_similarity * 0.3)
    
    def calculate_personality_compatibility(self, traits1: List[str], traits2: List[str]) -> float:
        """Calculate personality compatibility score"""
        if not traits1 or not traits2:
            return 0.5
            
        compatibility_score = 0.0
        total_comparisons = 0
        
        for trait1 in traits1:
            compatible_traits = PERSONALITY_COMPATIBILITY.get(trait1, [])
            for trait2 in traits2:
                total_comparisons += 1
                if trait2 in compatible_traits or trait1 == trait2:
                    compatibility_score += 1.0
                elif trait2 in traits1:  # Shared trait
                    compatibility_score += 0.8
                    
        return compatibility_score / max(total_comparisons, 1)
    
    def calculate_size_compatibility(self, size1: str, size2: str, intent: str) -> float:
        """Calculate size compatibility for safety"""
        if intent == "mating":
            # For mating, prefer similar sizes
            return 1.0 if size1 == size2 else 0.3
        elif intent == "playdate":
            # For playdates, check safe size combinations
            compatible_sizes = SIZE_COMPATIBILITY.get(size1, [])
            return 1.0 if size2 in compatible_sizes else 0.4
        else:
            # For adoption, size is less critical
            return 0.8
    
    def calculate_age_compatibility(self, age1: int, age2: int, intent: str) -> float:
        """Calculate age compatibility"""
        age_diff = abs(age1 - age2)
        
        if intent == "playdate":
            # Young pets play better with similar ages
            if age_diff <= 1:
                return 1.0
            elif age_diff <= 3:
                return 0.7
            else:
                return 0.4
        elif intent == "mating":
            # Breeding age considerations
            if 1 <= age1 <= 8 and 1 <= age2 <= 8:
                return 1.0 if age_diff <= 2 else 0.6
            else:
                return 0.2
        else:
            # For adoption, age is less critical
            return 0.8
    
    def calculate_location_score(self, loc1: Dict[str, Any], loc2: Dict[str, Any]) -> float:
        """Calculate location proximity score"""
        if not loc1 or not loc2:
            return 0.5
            
        try:
            coords1 = loc1.get("coordinates", [0, 0])
            coords2 = loc2.get("coordinates", [0, 0])
            
            if coords1 == [0, 0] or coords2 == [0, 0]:
                return 0.5
                
            # Calculate distance using Haversine formula (simplified)
            lat1, lon1 = coords1[1], coords1[0]
            lat2, lon2 = coords2[1], coords2[0]
            
            distance = np.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111  # Rough km conversion
            
            # Distance scoring (closer is better)
            if distance < 5:
                return 1.0
            elif distance < 15:
                return 0.8
            elif distance < 30:
                return 0.6
            elif distance < 50:
                return 0.4
            else:
                return 0.2
                
        except Exception:
            return 0.5
    
    def generate_recommendation_reasons(self, user_pet: PetProfile, candidate_pet: PetProfile, scores: Dict[str, float]) -> List[str]:
        """Generate human-readable reasons for the recommendation"""
        reasons = []
        
        if scores["breed_similarity"] > 0.7:
            reasons.append(f"Similar breeds: {user_pet.breed} and {candidate_pet.breed}")
        
        if scores["personality_compatibility"] > 0.7:
            common_traits = set(user_pet.personality_tags).intersection(set(candidate_pet.personality_tags))
            if common_traits:
                reasons.append(f"Shared traits: {', '.join(list(common_traits)[:3])}")
        
        if scores["size_compatibility"] > 0.8:
            reasons.append("Compatible sizes for safe interaction")
        
        if scores["age_compatibility"] > 0.8:
            reasons.append("Similar ages for better compatibility")
        
        if scores["location_score"] > 0.8:
            reasons.append("Located nearby for easy meetups")
        
        if candidate_pet.intent == "all":
            reasons.append("Open to any type of connection")
        
        return reasons[:3]  # Return top 3 reasons

# Initialize AI instance
ai_matcher = PetMatchingAI()

@app.get("/")
async def root():
    return {"message": "PawfectMatch AI Service is running! 🐾🤖"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "PawfectMatch AI"}

@app.post("/api/recommend", response_model=List[RecommendationResponse])
async def get_recommendations(request: RecommendationRequest):
    """Generate AI-powered pet recommendations"""
    try:
        recommendations = []
        user_pets = request.user_profile.pets
        
        if not user_pets:
            # No user pets to base recommendations on
            for candidate in request.candidate_pets:
                recommendations.append(RecommendationResponse(
                    petId=candidate.id,
                    score=50.0,
                    reasons=["New user - exploring options"]
                ))
            return sorted(recommendations, key=lambda x: x.score, reverse=True)
        
        for candidate_pet in request.candidate_pets:
            total_score = 0.0
            best_reasons = []
            max_individual_score = 0.0
            
            # Compare candidate with each user pet and take the best match
            for user_pet in user_pets:
                if user_pet.species != candidate_pet.species:
                    continue  # Skip different species
                
                # Calculate individual compatibility scores
                breed_sim = ai_matcher.calculate_breed_similarity(
                    user_pet.breed, candidate_pet.breed, user_pet.species
                )
                
                personality_compat = ai_matcher.calculate_personality_compatibility(
                    user_pet.personality_tags, candidate_pet.personality_tags
                )
                
                size_compat = ai_matcher.calculate_size_compatibility(
                    user_pet.size, candidate_pet.size, candidate_pet.intent
                )
                
                age_compat = ai_matcher.calculate_age_compatibility(
                    user_pet.age, candidate_pet.age, candidate_pet.intent
                )
                
                location_score = ai_matcher.calculate_location_score(
                    user_pet.location, candidate_pet.location
                )
                
                # Weighted scoring
                scores = {
                    "breed_similarity": breed_sim,
                    "personality_compatibility": personality_compat,
                    "size_compatibility": size_compat,
                    "age_compatibility": age_compat,
                    "location_score": location_score
                }
                
                individual_score = (
                    breed_sim * 0.25 +
                    personality_compat * 0.30 +
                    size_compat * 0.20 +
                    age_compat * 0.15 +
                    location_score * 0.10
                ) * 100
                
                if individual_score > max_individual_score:
                    max_individual_score = individual_score
                    best_reasons = ai_matcher.generate_recommendation_reasons(
                        user_pet, candidate_pet, scores
                    )
            
            # Intent matching bonus
            user_intents = [pet.intent for pet in user_pets]
            if candidate_pet.intent in user_intents or candidate_pet.intent == "all":
                max_individual_score += 10
                if "Compatible intentions" not in best_reasons:
                    best_reasons.append("Compatible intentions")
            
            # Ensure minimum score
            final_score = max(20.0, min(100.0, max_individual_score))
            
            recommendations.append(RecommendationResponse(
                petId=candidate_pet.id,
                score=final_score,
                reasons=best_reasons or ["General compatibility"]
            ))
        
        # Sort by score and return
        return sorted(recommendations, key=lambda x: x.score, reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/api/compatibility")
async def analyze_compatibility(request: CompatibilityRequest):
    """Analyze compatibility between two specific pets"""
    try:
        pet1, pet2 = request.pet1, request.pet2
        
        if pet1.species != pet2.species:
            return {
                "compatibility_score": 20.0,
                "factors": ["Different species"],
                "recommendation": "Not Recommended"
            }
        
        # Calculate compatibility factors
        breed_sim = ai_matcher.calculate_breed_similarity(pet1.breed, pet2.breed, pet1.species)
        personality_compat = ai_matcher.calculate_personality_compatibility(
            pet1.personality_tags, pet2.personality_tags
        )
        size_compat = ai_matcher.calculate_size_compatibility(pet1.size, pet2.size, pet1.intent)
        age_compat = ai_matcher.calculate_age_compatibility(pet1.age, pet2.age, pet1.intent)
        
        # Overall score
        compatibility_score = (
            breed_sim * 0.3 +
            personality_compat * 0.4 +
            size_compat * 0.2 +
            age_compat * 0.1
        ) * 100
        
        # Generate factors
        factors = []
        if breed_sim > 0.6:
            factors.append("Similar breed characteristics")
        if personality_compat > 0.6:
            factors.append(f"{len(set(pet1.personality_tags).intersection(set(pet2.personality_tags)))} shared personality traits")
        if size_compat > 0.8:
            factors.append("Compatible sizes")
        if age_compat > 0.8:
            factors.append("Similar ages")
        
        # Recommendation
        if compatibility_score >= 80:
            recommendation = "Highly Compatible"
        elif compatibility_score >= 60:
            recommendation = "Moderately Compatible"
        elif compatibility_score >= 40:
            recommendation = "May Need Supervision"
        else:
            recommendation = "Not Recommended"
        
        return {
            "compatibility_score": round(compatibility_score, 1),
            "factors": factors,
            "recommendation": recommendation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compatibility analysis error: {str(e)}")

@app.get("/api/breed-info")
async def get_breed_info(breed: str, species: str):
    """Get breed characteristics information"""
    try:
        breed_clean = breed.lower().strip()
        characteristics = BREED_CHARACTERISTICS.get(species, {}).get(breed_clean, {})
        
        if not characteristics:
            return {
                "characteristics": {
                    "temperament": [],
                    "energy_level": "medium",
                    "grooming_needs": "medium",
                    "health_concerns": []
                }
            }
        
        return {"characteristics": characteristics}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Breed info error: {str(e)}")

@app.post("/api/update-pet-data")
async def update_pet_data(pet_id: str, interaction_data: Dict[str, Any]):
    """Update pet's AI data based on interactions (placeholder for ML learning)"""
    try:
        # In a real implementation, this would update ML models based on user interactions
        # For now, return mock updated data
        
        return {
            "success": True,
            "personality_score": {
                "friendliness": np.random.randint(5, 10),
                "energy": np.random.randint(3, 10),
                "trainability": np.random.randint(4, 10),
                "socialness": np.random.randint(5, 10)
            },
            "compatibility_tags": ["friendly", "social", "adaptable"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )